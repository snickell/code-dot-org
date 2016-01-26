[Travis says](https://travis-ci.org/code-dot-org/code-dot-org): [![Build Status](https://travis-ci.org/code-dot-org/code-dot-org.svg?branch=staging)](https://travis-ci.org/code-dot-org/code-dot-org)

# Build setup
This document describes how to set up your workstation to develop for Code.org.

## Install OS-specific prerequisites
You can do Code.org development using OSX, Ubuntu, or Windows (running Ubuntu in a VM). Setup for Windows is more complicated and relatively few developers use it. Start with the instructions for your platform in the subsections below, followed by the Common Setup section.

### OS X Mavericks / Yosemite

1. Install Homebrew: `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
1. Run `sudo chown -R $(whoami):admin /usr/local/`. (Brew assumes it can write to subdirectories of /usr/local/, which not all installs of OSXallow. Running brew as root is discouraged.)
1. `brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb enscript gs mysql imagemagick rbenv ruby-build coreutils sqlite phantomjs`
  1. If it complains about an old version of `<package>`, run `brew unlink <package>` and run `brew install <package>` again
1. Set up MySQL
  1. Have launchd start mysql at login: `ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents`
  1. Start mysql now: `launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist`
1. Set up [RBENV](https://github.com/sstephenson/rbenv#homebrew-on-mac-os-x), ruby-build, and Ruby 2.2
  1. Add `if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi` to `~/.profile` or whatever profile gets sourced when you start your terminal. You should only have to do this once.
  1. source `~/.profile` or whatever you changed in the above step. You should only have to do this once.
  1. `git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build`
  1. `brew update`
  1. `brew upgrade rbenv ruby-build`
  1. `rbenv install 2.2.3`
  1. `rbenv global 2.2.3`
  1. `rbenv rehash`
1. Set up nvm
  1. These steps are now necessary because of problems with the newest versions of node. We want to be on node 0.12.4 and npm 2.10.1.
  1. Install node version manager `brew install nvm`
    1. follow the instructions in the output of the previous command to finish installing nvm. It should be something like this: `echo "source $(brew --prefix nvm)/nvm.sh" >> ~/.bashrc`
  1. Install the right version of node `nvm install v0.12.4`
  1. Make that your default version `nvm alias default v0.12.4`
  1. reinstall node_modules `cd apps; rm -rf node_modules && npm install; cd ..` (can be skipped if your version of node did not just change)
1. Ensure that openssl is linked (El Capitan issue)
  1. `brew link --force openssl`
1. Check that you have the correct versions of everything:
  1. open a new Terminal window  
  1. `ruby --version  # --> ruby 2.2.3`
  1. `nvm ls          # --> v0.12.4`
  1. `node --version  # --> v0.12.4`
  1. `npm --version   # --> 2.10.1`

### Ubuntu 14.04

1. `sudo apt-get update`
1. `sudo apt-get install -y git mysql-server mysql-client libmysqlclient-dev libxslt1-dev libssl-dev zlib1g-dev imagemagick libmagickcore-dev libmagickwand-dev openjdk-7-jre-headless libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev curl pdftk libsqlite3-dev phantomjs`
  * **Hit enter and select default options for any configuration popups**
1. Upgrade npm to 2.0. If `npm -v` says less than 2.0 then
  * `sudo add-apt-repository ppa:chris-lea/node.js  `
  * `sudo apt-get update`
  * `sudo apt-get install nodejs`
1. Either A. Install Ruby 2.2 from OS packages; B. Setup `rbenv`; or C. Setup `rvm`
    - A. OS packages (from the [Brightbox Ubuntu PPA](https://www.brightbox.com/docs/ruby/ubuntu/)):
        - `sudo apt-get install software-properties-common`
        - `sudo apt-add-repository ppa:brightbox/ruby-ng`
        - `sudo apt-get update`
        - `sudo apt-get install ruby2.2 ruby2.2-dev`
    - B. `rbenv`: ([instructions](https://github.com/sstephenson/rbenv#installation))
        1. Install `rbenv` and `ruby-build`
        1. `rbenv install 2.2.3`
        1. `rbenv global 2.2.3`
        1. `rbenv rehash`
    - C. `rvm`. A few folks have had more luck with rvm vs rbenv on linux.
        1. Install rvm from https://rvm.io/
        1. `rvm install 2.2.3`
1. Install Node.js 0.12.4 and npm 2.10.1
  1. Option A - nodesource repository
    1. `curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -`
    1. `sudo apt-get install -y nodejs`
  1. Option B - Manual install
    1. [Nodejs.org](https://nodejs.org/download/)
1. Check that you have the correct versions of everything:
  1. open a new Terminal window  
  1. `ruby --version  # --> ruby 2.2.3`
  1. `node --version  # --> v0.12.4`
  1. `npm --version   # --> 2.10.1`

#### Windows note: use an Ubuntu VM

Many Windows developers have found that setting up an Ubuntu virtual machine is less painful than getting Ruby and other prerequisites running on Windows.

* Option A: Use [VMWare Player](https://my.vmware.com/web/vmware/free#desktop_end_user_computing/vmware_player/4_0) and an [Ubuntu 14.04 iso image](http://releases.ubuntu.com/14.04.2/ubuntu-14.04.2-desktop-amd64.iso)
* Option B: Use vagrant ([install](https://docs.vagrantup.com/v2/installation/)):
  1. First clone the code.org git repo to get the provided Vagrantfile (you will be able to skip step 1 of the common setup instructions): `git clone https://github.com/code-dot-org/code-dot-org.git`
  1. `cd code-dot-org`
  1. `vagrant up`
  1. `vagrant ssh`
  1. Goto step 2 of the common setup instructions
* Option C: Use AWS EC2: [launch Ubuntu 14.04 AMI](https://console.aws.amazon.com/ec2/home?region=ap-northeast-1#launchAmi=ami-d9fdddd8)

## Common setup

1. `git clone https://github.com/code-dot-org/code-dot-org.git`
1. `sudo gem install bundler -v 1.10.6`
1. `rbenv rehash` (if using rbenv)
1. `cd code-dot-org`
1. `bundle install`
1. `rake install`
1. `rake build`
1. `sudo chown -R $(whoami) $HOME/.npm` (do we still need this step when using nvm?)


## Organizational Structure

Our code is segmented into four parts:

* Blockly Core is the visual programming language platform used for the interactive tutorials.
* Blockly includes apps—blockly puzzles built based on Blockly Core.
  * [Hour of Code](http://studio.code.org/hoc/1)
* Dashboard, is the tutorial platform which organizes blockly levels into tutorials.
  * [Code Studio](http://studio.code.org)
* Pegasus is the main site which also includes the teacher dashboard (support for teachers to track student progress).
  * [code.org](http://code.org)
  * [csedweek.org](http://csedweek.org)
  * [Teacher Dashboard](http://code.org/teacher-dashboard)

## Running Dashboard

1. `cd code-dot-org`
2. `rake build:dashboard` (Generally, do this after each pull)
3. `bin/dashboard-server`
4. Visit [http://localhost.studio.code.org:3000/](http://localhost.studio.code.org:3000/)

## Running Pegasus

1. `cd code-dot-org`
2. `rake build:pegasus` (Generally, do this after each pull)
3. `bin/pegasus-server`
4. Visit [http://localhost.code.org:3000/](http://localhost.code.org:3000/)

## Building Javascript (apps, blockly-core, and code-studio) (optional)

The studio.code.org default dashboard install includes a static build of blockly and of code-studio js, but if you want to make modifications to these you'll want to enable building them in the build:

### Enabling Apps Builds

You'll need to do this once:

1. OS X:
  1. Install the [Java 8 JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
1. `cd code-dot-org`
1. To build apps/blocky-core, edit `locals.yml` to add:
  1. Add `build_apps: true`
  1. Add `build_blockly_core: true` (if you want to build blockly core -- not necessary if you only want to make changes to apps)
  1. Add `use_my_apps: true`
1. To build code_studio js, edit `locals.yml` to add:
  1. Add `use_my_code_studio: true`
1. `rake install`

This configures your system to build apps/blockly-core/code-studio whenever you run `rake build` and to use the versions that you build yourself.

### Building

1. `cd code-dot-org`
1. `rake build`

This will build everything you have set to build in `locals.yml`.

You can use `rake build:apps`, `rake build:blockly_core` and `rake build:code_studio` to build a specific project.

You can also set `build_dashboard: false` and/or `build_pegasus: false` in `locals.yml` if you don't need to build these frequently. They default to `true`.

Alternatively, you can run: `rake build:core_and_apps_dev`, which will build blockly core and the apps bundle without running tests and without localization.

## Contributing

Wondering where to start?  See our [contribution guidelines](CONTRIBUTING.md)
for more information on helping us out.
