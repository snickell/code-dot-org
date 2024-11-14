#!/bin/bash
# This script demonstrates how to use `docker buildx` to build container
# images for the linux/amd64 and linux/arm64 platforms.  It creates a
# `docker buildx` builder instance when required.
#
# If you change the platforms, be sure to
#
#  (1) delete the buildx builder named `skaffold-builder`, and
#  (2) update the corresponding node-affinities in k8s/pod.yaml.

NATIVE_PLATFORM=$(docker info --format '{{.OSType}}/{{.Architecture}}' | sed -e 's/aarch64/arm64/' -e 's/x86_64/amd64/')
PLATFORMS=${PLATFORMS:=$NATIVE_PLATFORM}

for platform in ${PLATFORMS//,/ }; do
  docker buildx inspect --bootstrap | grep '^Platforms' | grep $platform || {
    echo "Platform $platform is not supported by the current builder."
    echo "Please create a new builder like 'docker buildx create --platform $PLATFORMS' and try again."
    exit 1
  }
done

CACHE_IMAGE_NAME="$IMAGE-cache"
cache_from="--cache-from type=registry,ref=$CACHE_IMAGE_NAME"

# Building for multiple platforms requires pushing to a registry
# as the Docker Daemon cannot load multi-platform images. 
if [ "$PUSH_IMAGE" = true ]; then
  args="--platform $PLATFORMS --push"
  cache_to="--cache-to type=registry,ref=$CACHE_IMAGE_NAME"
fi

set -x # show the command
docker buildx build --load --tag $IMAGE $args $cache_from $cache_to "$BUILD_CONTEXT" $@
