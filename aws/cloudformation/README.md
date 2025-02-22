# /cloudformation

This directory contains CloudFormation stack templates, associated Custom Resource Lambda functions, and some other related scripts and configuration.

- [`cloud_formation_stack.yml.erb`](cloud_formation_stack.yml.erb) - Stack template for the monolithic Code.org application.
- `*.yml`, `*.yml.erb` (e.g., [vpc.yml.erb](vpc.yml.erb), [iam.yml.erb](iam.yml.erb), [data.yml.erb](data.yml.erb), [lambda.yml.erb](lambda.yml.erb), [alerting.yml.erb](alerting.yml.erb), [`geocoder.yml`](geocoder.yml), [`drone-stack.yml`](drone-stack.yml)) - Various other standalone or service-oriented stack templates.
- `*.js, *.rb` (e.g., [`ami-manager.js`](ami-manager.js), [`count_asg.js`](count_asg.js), [`vpcClassicLink.js`](vpcClassicLink.js), [`fast_snapshot_restore.rb`](fast_snapshot_restore.rb)) - Custom Resource Lambda function code.
- `package.json`, `yarn.lock`, `test/*` -  Package definitions and test files related to Custom Resource Lambda functions.

## See also

- [`stack.rake`](../../lib/rake/stack.rake), [`adhoc.rake`](../../lib/rake/adhoc.rake) - Rakefiles implementing `stack:*` / `adhoc:*` commands for managing various CloudFormation stacks.
- [`AWS::CloudFormation`](../../lib/cdo/aws/cloud_formation.rb) - Class managing configuration and deployment of AWS CloudFormation stacks.
- [`Cdo::CloudFormation::StackTemplate`](../../lib/cdo/cloud_formation/stack_template.rb) - Controller class providing the ERB binding context for CloudFormation stack templates.
- [`Cdo::CloudFormation::CdoApp`](../../lib/cdo/cloud_formation/cdo_app.rb) - Stack-template controller specific to the monolithic Code.org application stack.

## Testing Out CloudFormation Templates Old and New

So you've changed a cloudformation template, call it 'template.yml', or created a new one. How do you test your changes without affecting production services?

First, consult [Specific Template/Stack Notes](#specific-template-stack-notes) to see if there are any for your stack of interest.

### If you have a .yml.erb file

If you're dealing with a .yml.erb file, you'll need to search for the right ruby/rake code to either render it to a template .yml, or directly deploy it. Good places to start your search would be the `lib/rake/stack.rake` file, or there may be a ruby script nearby the file.

### If you have a .yml file

Most .yml files (see Exceptions below) are straight forward to deploy and test :

- Login to the __codeorg-dev__ AWS account
- Select your region, Oregon suggested
- Go to CloudFormation->Stacks
- Click Create Stack->With New Resources
- Select the "Upload a template file" option
- Upload a template file: click "Choose File" button and select your template.yml file
- Click the Next button to go to the Parameters page
- Set "Stack name" to a unique descriptive name for your deploy (a branch?)
- Fill in any other parameters as appropriate and specific to your particular template which defines them. Some of the params may require research to figure out.
- Add the tag "created_by" with your email as the value
- Click "Next" a few times then "Submit" to start your stack creating
- Remember to come back and delete the stack when you're finished testing

#### Exceptions

Incomplete list of .yml files may require a script to regenerate or test:

- access_logs.yml

## Specific Template/Stack Notes

### IAM

The IAM stack is deployed manually by an AWS Admin. Best practice is to create a PR, obtain approval, then attempt the deployment before merging. If there are issues, fix them in the PR and only merge the PR after the code is known to be good.

To validate the "iam.yml.erb" template:

```
export AWS_PROFILE=codeorg-admin
# optionally prefix the following with VERBOSE=1
bundle exec rake stack:iam:validate RAILS_ENV=production
unset AWS_PROFILE
```

To update the stack, you will need to set the `ADMIN` environment variable to [change the role](https://github.com/code-dot-org/code-dot-org/blob/staging/lib/cdo/aws/cloud_formation.rb#L207) executing the change.

```
export AWS_PROFILE=codeorg-admin
ADMIN=1 bundle exec rake stack:iam:start RAILS_ENV=production
unset AWS_PROFILE
```

### domain_redirect

"domain_redirect.yml.erb" describes a generic domain redirect stack, and is used with "domain_redirect_deploy.sh"
