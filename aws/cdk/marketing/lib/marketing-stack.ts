import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from "aws-cdk-lib/aws-iam";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager';

import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import { CfnParameter } from 'aws-cdk-lib';

export interface MarketingStackProps extends cdk.StackProps {
  readonly stage: 'test' | 'staging';
}

export class MarketingStack extends cdk.Stack {
  private rootHostedZone: route53.IHostedZone;
  private ecsService: ecs_patterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props?: MarketingStackProps) {
    super(scope, id, props);

    this.createRoute53Resources();
    this.createElasticContainerService();
    this.createGithubActionDeployerIamUser();
  }

  private createRoute53Resources() {
    this.rootHostedZone = new route53.HostedZone(this, 'RootHostedZone', {
      zoneName: 'marketing.dev-code.org'
    })
  }

  private createElasticContainerService() {
    // ACM Certificate
    const certificate = new acm.Certificate(this, 'TLSCertificate', {
      domainName: 'dev.marketing.dev-code.org',
      validation: acm.CertificateValidation.fromDns(this.rootHostedZone),
    });

    // Create a cluster
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    const cluster = new ecs.Cluster(this, 'EcsCluster', { vpc });

    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO)
    });

    const marketingImageShaSum = new CfnParameter(this, "ContainerImageHash", {
      type: "String",
      description: "The sha256sum of the marketing container image."});

    // Create Service
    this.ecsService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "FargateService", {
      cluster,
      certificate,
      domainName: 'dev.marketing.dev-code.org',
      domainZone: this.rootHostedZone,
      taskImageOptions: {
        /**
         * Cloudformation/CDK uses the latest tagged version for the respective stage (instead of a sha256sum). This is because CDK is not aware of the current hash of the deployed image.
         * This prevents the case that when Cloudformation/CDK deploys a new task definition due to a delta, an older version of the image will not be consumed and maintains the ability for
         * the respective stages to consume the correct version that is expected.
         * 
         * When the deployment Github Action is trigerred, the deployment process will update this image field to the sha256sum that is produced by the build process.
         */
        image: ecs.ContainerImage.fromRegistry(`ghcr.io/code-dot-org/marketing@sha256:${marketingImageShaSum.valueAsString}`),
        containerPort: 3000,
        secrets: {
          CONTENTFUL_TOKEN: ecs.Secret.fromSecretsManager(secretsManager.Secret.fromSecretCompleteArn(this, 'Contentful', 'arn:aws:secretsmanager:us-west-2:165336972514:secret:development/marketing/90t6bu6vlf76/contentful-fOz371'), 'CONTENTFUL_TOKEN')
        },
        environment: {
          CONTENTFUL_SPACE_ID: '90t6bu6vlf76',
          CONTENTFUL_ENV_ID: 'master',
          CONTENTFUL_API_HOST: 'cdn.contentful.com',
          CONTENTFUL_EXPERIENCE_CONTENT_TYPE_ID: 'experience'
        }
      },
    });
  }

  private createGithubActionDeployerIamUser() {
    
    // Github Action IAM User
    const user = new iam.User(this, 'MarketingGithubDeployerUser', {
      userName: `marketing-github-deployer-development`,
    });

    // Minimal IAM policy for the Github Action Deployer
    // See: https://github.com/aws-actions/amazon-ecs-deploy-task-definition?tab=readme-ov-file#permissions
    const policy = new iam.Policy(this, 'MarketingGithubDeployerUserPolicy', {
      policyName: 'MarketingGithubDeployerUserIamUserPolicy',
      statements: [
        new iam.PolicyStatement({
          actions: [
            "sts:AssumeRole",
         ],
          resources: [`arn:aws:iam::${this.account}:role/cdk-hnb659fds-deploy-role-${this.account}-${this.region}`],
        }),
      ],
    });

    policy.attachToUser(user);

    const accessKey = new iam.AccessKey(this, "MarketingGithubDeployerAccessKey", { user });

    // Store the access key in Secrets Manager
    new secretsManager.Secret(this, "MarketingGithubDeployerAccessKeySecret", {
      secretObjectValue: {
        accessKeyId: cdk.SecretValue.resourceAttribute(accessKey.accessKeyId),
        secretAccessKey: accessKey.secretAccessKey,
      }
    });    
  }
}
