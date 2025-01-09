#!/bin/bash

set -e

# TODO - merge this with the main template, or make this deployable via rake stack

# aws cloudformation deploy \
#   --template-file ./ai_diff.yml \
#   --stack-name darin-ai-diff \
#   --capabilities CAPABILITY_NAMED_IAM \
#   --parameter-overrides \
#     Environment=dev-darin \
#   --tags \
#     Environment=Development

aws cloudformation deploy \
  --template-file ./ai_diff.yml \
  --stack-name ai-diff-production \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    Environment=production \
    VectorIndexCreated=true \
  --tags \
    Environment=production