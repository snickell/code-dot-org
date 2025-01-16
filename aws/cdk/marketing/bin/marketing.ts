#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MarketingStack } from '../lib/marketing-stack';

const app = new cdk.App();


// const pipeline = new GitHubWorkflow(app, 'Pipeline', {
//   synth: new ShellStep('Build', {
//     commands: [
//       'yarn install',
//       'yarn build',
//     ],
//   }),
//   awsCreds: AwsCredentials.fromOpenIdConnect({
//     gitHubActionRoleArn: 'arn:aws:iam::<account-id>:role/GitHubActionRole',
//   }),
// });

// const workflowInput = {
//   marketingImageHash: {
//     description: 'The sha256sum of the container image to deploy',
//     required: true,
//     type: 'string'
//   }
// }

// pipeline.workflowFile.patch(JsonPatch.add("/on/workflow_dispatch/inputs", workflowInput));

// Build the stages
// const stagingStage = new StagingStage(app, 'Staging', { env: { account: '165336972514', region: 'us-west-2' } });
// const testStage = new TestStage(app, 'Test', { env: { account: '165336972514', region: 'us-west-2' } });

// pipeline.addStage(stagingStage);
// pipeline.addStage(testStage);

new MarketingStack(app, 'MarketingStack-Staging', {
  env: { account: '165336972514', region: 'us-west-2' },
  stage: 'staging',
});

// new MarketingStack(app, 'MarketingStack-Test', {
//   env: { account: '165336972514', region: 'us-west-2' },
//   stage: 'test'
// });