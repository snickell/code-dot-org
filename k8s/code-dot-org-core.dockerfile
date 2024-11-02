# syntax=docker/dockerfile:1

################################################################################
FROM ubuntu:22.04 AS code-dot-org-base
################################################################################

ARG \
  USERNAME=code-dot-org \
  UID=1000 \
  GID=1000 \
  SRC="/code-dot-org"

ENV \
  AWS_PROFILE=cdo \
  SRC=${SRC}

SHELL [ "/bin/sh", "-euxc" ]

RUN <<EOF
  # Ideally install all apt packages here
  apt-get -qq update
  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    autoconf \
    bison \
    build-essential \
    chromium-browser \
    curl \
    gdb \
    git \
    git-lfs \
    imagemagick \
    libffi-dev \
    libgdbm6 \
    libgdbm-dev \
    libmagickwand-dev \
    libmysqlclient-dev \
    libncurses5-dev \
    libreadline6-dev \
    libsqlite3-dev \
    libssl-dev \
    libyaml-dev \
    lsof \
    mysql-client \
    parallel \
    python3-pip \
    rbenv \
    rsync \
    sudo \
    time \
    wget \
    unzip \
    tzdata \
    zlib1g-dev \
    zsh \
    # surpress noisy dpkg install/setup lines (errors & warnings still show)
    > /dev/null
  #
  # install node, based on instructions at https://github.com/nodesource/distributions#using-ubuntu-1
  curl -sL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  corepack enable # corepack required for yarn support
  # 
  # Setup 'code-dot-org' user and group
  echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers
  groupadd -g ${UID} ${USERNAME}
  useradd --system --create-home --no-log-init -s /bin/zsh -u ${UID} -g ${UID} ${USERNAME}
  # FIXME: why did I do this?
  chown -R ${USERNAME} /usr/local
  #
  # Create ${SRC} directory
  mkdir -p ${SRC}
  chown ${UID}:${GID} ${SRC}
EOF

USER ${USERNAME}
ENV HOME=/home/${USERNAME}
WORKDIR ${SRC}

################################################################################
FROM code-dot-org-base AS code-dot-org-rbenv
################################################################################

SHELL [ "/bin/sh", "-euxc" ]

COPY --chown=${UID} \
  .ruby-version \
  ./

RUN <<EOF
  mkdir -p "$(rbenv root)"/plugins
  git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build
  rbenv install
EOF

################################################################################
FROM code-dot-org-base AS code-dot-org-user-utils
################################################################################

ARG RAILS_ENV=development
ENV RAILS_ENV=${RAILS_ENV}

WORKDIR ${HOME}

RUN <<EOF
  #
  # Install oh-my-zsh
  sh +x -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  #
  # Install AWSCLI
  if [ $(uname -m) = "aarch64" ]; then
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip";
  else
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip";
  fi
  unzip -qq awscliv2.zip
  ./aws/install
  rm awscliv2.zip
  #
  # Add CHROME_BIN env var to bashrc
  echo '# Chromium Binary\nexport CHROME_BIN=/usr/bin/chromium-browser' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc
  #
  # Setup rbenv & ruby-build
  echo 'eval "$(rbenv init -)"' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc
  #
  # install pdm for managing our python dependencies
  pip install pdm
  #
  # Install Sauce Connect Proxy
  mkdir sauce_connect
  cd sauce_connect
  if [ $(uname -m) = "aarch64" ]; then
    curl -s "https://saucelabs.com/downloads/sauce-connect/5.2.1/sauce-connect-5.2.1_linux.aarch64.tar.gz" -o "sauce-connect.tar.gz";
  else
    curl -s "https://saucelabs.com/downloads/sauce-connect/5.2.1/sauce-connect-5.2.1_linux.x86_64.tar.gz" -o "sauce-connect.tar.gz";
  fi
  tar -xzf sauce-connect.tar.gz
  cp sc /usr/local/bin
  cd ..
  rm -rf sauce_connect
  #
  # Enable Git LFS in ~/.gitconfig
  git lfs install
EOF

WORKDIR ${SRC}

################################################################################
FROM code-dot-org-user-utils
################################################################################

ENV \
  USERNAME=${USERNAME} \
  UID=${UID} \
  GID=${GID}

# Copy in ~/.rbenv (built in parallel)
COPY --chown=${UID} --link \
  --from=code-dot-org-rbenv ${HOME}/.rbenv \
  ${HOME}/.rbenv

# `kubectl exec` skips entrypoint (!), so this is the easiest way to
# accomplish `eval $(rbenv init -)` that works for kubectl exec.
ENV PATH=${HOME}/.rbenv/shims:${PATH}

WORKDIR ${SRC}
