#!/bin/bash

set -e

# This script deploys the AccessLogs stack. Because it references two external
# Ruby scripts, it must be packaged before deployment.

STACK_NAME=AccessLogs
S3_BUCKET=cf-templates-p9nfb0gyyrpf-us-east-1
TEMPLATE_FILE=access_logs.yml
PACKAGED_TEMPLATE_FILE=access_logs_packaged.yml
CHANGE_SET_NAME="AccessLogsChangeSet-$(date +%Y%m%d%H%M%S)"

echo "Packaging the AccessLogs stack"
aws cloudformation package \
  --template-file $TEMPLATE_FILE \
  --s3-bucket $S3_BUCKET \
  --output-template-file $PACKAGED_TEMPLATE_FILE

echo "Creating a change set for the AccessLogs stack"

TableName="access_logs"
LogFields='"timestamp,c-ip,time-to-first-byte,sc-status,sc-bytes,cs-method,cs-protocol,cs-host,cs-uri-stem,cs-bytes,x-edge-location,x-edge-request-id,x-host-header,time-taken,cs-protocol-version,c-ip-version,cs-user-agent,cs-referer,cs-uri-query,x-edge-response-result-type,x-forwarded-for,ssl-protocol,ssl-cipher,x-edge-result-type,fle-encrypted-fields,fle-status,sc-content-type,sc-content-len,sc-range-start,sc-range-end,c-port,x-edge-detailed-result-type,c-country,cs-accept-encoding,cs-accept,cache-behavior-path-pattern,cs-headers-count"'
BucketName="cdo-access-logs"
DatabaseName="cdo_access_logs"
BucketPrefix="access-logs/"
OldLogFields='"timestamp,c-ip,time-to-first-byte,sc-status,sc-bytes,cs-method,cs-protocol,cs-host,cs-uri-stem,cs-bytes,x-edge-location,x-edge-request-id,x-host-header,time-taken,cs-protocol-version,c-ip-version,cs-user-agent,cs-referer,cs-uri-query,x-edge-response-result-type,x-forwarded-for,ssl-protocol,ssl-cipher,x-edge-result-type,fle-encrypted-fields,fle-status,sc-content-type,sc-content-len,sc-range-start,sc-range-end,c-port,x-edge-detailed-result-type,c-country,cs-accept-encoding,cs-accept,cache-behavior-path-pattern,cs-headers-count"'
ShardCount="6"

aws cloudformation create-change-set \
  --stack-name $STACK_NAME \
  --template-body file://$PACKAGED_TEMPLATE_FILE \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=TableName,ParameterValue="$TableName" \
    ParameterKey=LogFields,ParameterValue="$LogFields" \
    ParameterKey=BucketName,ParameterValue="$BucketName" \
    ParameterKey=DatabaseName,ParameterValue="$DatabaseName" \
    ParameterKey=BucketPrefix,ParameterValue="$BucketPrefix" \
    ParameterKey=OldLogFields,ParameterValue="$OldLogFields" \
    ParameterKey=ShardCount,ParameterValue="$ShardCount" \
  --change-set-name $CHANGE_SET_NAME

# Construct URL for the change set in the AWS Console
REGION=$(aws configure get region)
CHANGE_SET_URL="https://${REGION}.console.aws.amazon.com/cloudformation/home?region=${REGION}#/stacks/changesets/changes?stackId=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].StackId' --output text)&changeSetId=$(aws cloudformation describe-change-set --stack-name $STACK_NAME --change-set-name $CHANGE_SET_NAME --query 'ChangeSetId' --output text)"

echo "Change set created. View it in the console:"
echo $CHANGE_SET_URL

echo "Cleaning up"
rm $PACKAGED_TEMPLATE_FILE
