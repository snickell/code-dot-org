# Static Error Pages

This directory contains static HTML error pages to be used by CloudFront, as well as a complete static /learn page to provide learning resources to users in the event of our main Rails application being down.

This entire directory can be copied to the appropriate S3 path with no environment differences.

## Updating the static error-pages and /learn page

See our internal Google docs, "Engineering/Hour of Code/How To - Create Static /learn Fallback Page"

## Deploy to Staging to preview

```bash
aws s3 cp ./static-error-pages s3://cdo-dist/staging/assets/error-pages --recursive --acl public-read
```

Preview the files to ensure they appear as desired, and that the permissions are correct.

* https://staging-studio.code.org/assets/error-pages/500.html
* https://staging-studio.code.org/assets/error-pages/site-down.html
* https://staging-studio.code.org/assets/error-pages/learn/index.html
* etc...

## Deploy to additional environments

Once reviewed, we can copy the files from Staging to other environments with commands like the following.

```bash
aws s3 cp s3://cdo-dist/staging/assets/error-pages s3://cdo-dist/adhoc/assets/error-pages --recursive --acl public-read
aws s3 cp s3://cdo-dist/staging/assets/error-pages s3://cdo-dist/test/assets/error-pages --recursive --acl public-read
aws s3 cp s3://cdo-dist/staging/assets/error-pages s3://cdo-dist/levelbuilder/assets/error-pages --recursive --acl public-read
aws s3 cp s3://cdo-dist/staging/assets/error-pages s3://cdo-dist/production/assets/error-pages --recursive --acl public-read
```

## Update Cloudfront CDN to use these static error pages

Our Cloudfront CDN Distributions are configured to serve these custom error pages. This is managed by Cloudformation within this repo.

* [/lib/cdo/aws/cloudfront.rb](/lib/cdo/aws/cloudfront.rb)
