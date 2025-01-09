#!/bin/bash

set -e

# TODO - merge this with the main template, or make this deployable via a rake stack task

aws cloudformation deploy \
  --template-file ./ai_diff.yml \
  --stack-name darin-ai-diff \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    Environment=dev-darin \
  --tags \
    Environment=Development
