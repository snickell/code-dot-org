#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

set -x

#git lfs pull && \
bundle exec rake install:hooks && \
bundle exec rake install:locals_yml && \
wget http://192.168.1.114:8080/bootstrap-osx.sql && \
mysql -uroot -hdb < bootstrap-osx.sql && \
bundle exec rake package && \
cd apps && \
rm -rf node_modules && \
yarn install && \
yarn build && \
cd ..
cd dashboard && \
bin/rails db:migrate RAILS_ENV=development && \
bin/rails db:migrate RAILS_ENV=test && \
cd ..
