#!/bin/bash
# This script demonstrates how to use `docker buildx` to build container
# images for the linux/amd64 and linux/arm64 platforms.  It creates a
# `docker buildx` builder instance when required.
#
# If you change the platforms, be sure to
#
#  (1) delete the buildx builder named `skaffold-builder`, and
#  (2) update the corresponding node-affinities in k8s/pod.yaml.

echo
echo "buildx.sh, env vars:"
export
echo
echo

NATIVE_PLATFORM=$(docker info --format '{{.OSType}}/{{.Architecture}}' | sed -e 's/aarch64/arm64/' -e 's/x86_64/amd64/')
PLATFORMS=${PLATFORMS:=$NATIVE_PLATFORM}

echo "Native platform: $NATIVE_PLATFORM"
echo "Building for platforms: $PLATFORMS"

for platform in ${PLATFORMS//,/ }; do
  docker buildx inspect --bootstrap | grep '^Platforms' | grep $platform || {
    echo "Platform $platform is not supported by the current builder."
    echo "Please create a new builder like 'docker buildx create --platform $PLATFORMS' and try again."
    exit 1
  }
done

# Building for multiple platforms requires pushing to a registry
# as the Docker Daemon cannot load multi-platform images. 
if [ "$PUSH_IMAGE" = true ]; then
  args="--platform $PLATFORMS --push"
else
  args="--load"
fi

DOCKERFILE=${1:-"$BUILD_CONTEXT/Dockerfile"}

set -x # show the command
docker buildx build -f "$DOCKERFILE" --tag $IMAGE $args "$BUILD_CONTEXT"
