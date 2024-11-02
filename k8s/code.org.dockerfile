# syntax=docker/dockerfile:1

# Pull in the static assets and db seed layers
# built from separate dockerfiles by skaffold
ARG CODE_ORG_STATIC
ARG CODE_ORG_DB_SEED

FROM $CODE_ORG_STATIC as code.org-static
FROM $CODE_ORG_DB_SEED as code.org-db-seed

################################################################################
FROM ubuntu:22.04 as code.org-base
################################################################################

ARG \
  USERNAME=code.org \
  UID=1000 \
  GID=1000 \
  NODE_VERSION=20.18.0 \
  YARN_VERSION=1.22.22 \
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
  # Setup 'code.org' user and group
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
FROM code.org-base as code.org-rbenv
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

COPY --chown=${UID} \
  Gemfile \
  Gemfile.lock \
  ./

RUN <<EOF
  eval "$(rbenv init -)"
  gem install bundler -v 2.3.22
  rbenv rehash
EOF

RUN --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=${SRC}/vendor/cache <<EOF
  eval "$(rbenv init -)"
  bundle install --quiet
EOF

################################################################################
FROM code.org-base as code.org-user-utils
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
  pip install --prefix=/usr/local pdm
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
FROM code.org-user-utils as code.org-node_modules
################################################################################

COPY --chown=${UID} \
  ./apps/package.json \
  ./apps/yarn.lock \
  ./apps/.yarnrc.yml \
  ./apps/

COPY --chown=${UID} \
  ./apps/.yarn \
  ./apps/.yarn/

COPY --chown=${UID} \
  ./apps/eslint \
  ./apps/eslint/

RUN \
  #
  # Instuct Docker to maintain a build cache for yarn package downloads
  # so we don't have to re-download npms whenever package.json changes
  # --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=${HOME}/.cache/yarn \
<<EOF
  #
  # Install apps/node_modules using yarn
  cd apps
  yarn install --frozen-lockfile
  ls -l | grep node_modules
EOF

################################################################################
FROM code.org-user-utils
################################################################################

RUN \
  #
  # We don't copy in .git (huge), but `bundle exec rake install` references .git in 
  # a couple places, like git hooks, and fails without it, create a blank .git for now
  git init -b staging --quiet && \
  true

# NOTE: `COPY --link` has been disabled in Docker 24 due to a bug in moby
# as of today, it does nothing unless `Use containerd for pulling and storing images` is enabled
# for explanation see: https://github.com/docker/buildx/issues/1099#issuecomment-1524940116
# upstream issue: https://github.com/moby/moby/issues/45111
#
# Unfortunately "use containerd" appears to non-performant, it is ridiculously slow
# at handling the "exporting image" step at the end of a build, possibly/probably due
# to a file-by-file diffing step (instead of relying on nanosecond filesystem timestamps)
#
# Here is an issue with somebody having a similar problem with the containerd differ:
# https://github.com/moby/buildkit/issues/1704
#
# This was reported to be fixed by:
# https://github.com/moby/buildkit/pull/2181
# But some of that funcationality may have been reverted a few months later:
# https://github.com/moby/buildkit/pull/2480
#
# Meanwhile, upstream containerd appears to have this issue with no fix in sight:
# https://github.com/containerd/continuity/pull/145
#
# Question: what if any set of builders should enable --link
# in a way that's performant on Docker 24?

# Link in large static assets built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code.org-static / \
  ./

# Link in levels and other db seed data built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code.org-db-seed  / \
  ./

# Copy in apps/node_modules (built in parallel)
COPY --chown=${UID} --link \
  --from=code.org-node_modules ${SRC}/apps/node_modules \
  ./apps/node_modules

# Copy in ~/.rbenv (built in parallel)
COPY --chown=${UID} --link \
  --from=code.org-rbenv ${HOME}/.rbenv \
  ${HOME}/.rbenv

# Copy in the rest of the source code
COPY --chown=${UID} --link ./ ./

# SETUP SOME HACK WORKAROUNDS FOR APPLE SILICON
# These are only required for installing Apple Silicon hack workarounds from code.org-rbenv
#
# COPY --chown=${UID} --from=code.org-rbenv ${SRC}/.bundle ${SRC}/.bundle
# COPY --chown=${UID} --from=code.org-rbenv ${SRC}/.bundle ${SRC}/dashboard/.bundle
# COPY --chown=${UID} --from=code.org-rbenv ${SRC}/Gemfile ${SRC}/Gemfile
#
# DONE HACK WORKAROUNDS FOR APPLE SILICON

# `kubectl exec` skips entrypoint (!), so this is the easiest way to
# accomplish `eval $(rbenv init -)` that works for kubectl exec.
ENV PATH=${HOME}/.rbenv/shims:${PATH}

RUN <<EOF
  ls -l
EOF
# COPY <<-EOT ./docker-cmd.sh
# #!/bin/zsh

# echo "Starting dashboard-server..."

# exec ./bin/dashboard-server
# EOT

# CMD [ "./docker-cmd.sh" ]

CMD [ "./bin/dashboard-server" ]