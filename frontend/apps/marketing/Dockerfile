# syntax=docker.io/docker/dockerfile:1.4
# This file was built based off the Next.js recommended Dockerfile
# See: https://github.com/vercel/next.js/tree/canary/examples/with-docker

ARG NODE_VERSION=20 # LTS EOL: 2025-04-30
ARG DEBIAN_VERSION=bookworm # LTS EOL: 2028-06-30

FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS base

##############################################################################
# Source Code Layer                                                          #
#                                                                            #
# Takes the `frontend` monorepo and prunes any apps or packages that are not #
# needed for the target docker image.                                        #
#                                                                            #
# This generates a partial monorepo removing unneeded packages and apps.     #
#                                                                            #
# Input: The base operating system                                           #
# Output: The pruned partial monorepo for the target app                     #
##############################################################################

FROM base AS source-code

# Enable corepack
RUN corepack enable

WORKDIR /app

COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# See: https://turbo.build/repo/docs/reference/prune
RUN yarn turbo prune @code-dot-org/marketing --docker

##############################################################################
# Builder Layer                                                              #
#                                                                            #
# Builds the partial `frontend` monorepo for the target application          #
#                                                                            #
# Inputs: The base operating system and pruned `frontend` monorepo           #
# Output: The built version of the target application                        #
##############################################################################

FROM base AS builder

# Enable corepack
RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --link --from=source-code /app/out/json/ .
RUN yarn install
 
# Build the project
COPY --link --from=source-code /app/out/full/ .
RUN yarn turbo run build

##############################################################################
# Runnner Layer                                                              #
#                                                                            #
# Runtime execution options for the application                              #
# Note: the source code is not included in the final image                   #
#                                                                            #
# Inputs: The base operating system and built version of the target app      #
# Output: Rootless execution env for the target app with minimal artifacts   #
##############################################################################

FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/standalone ./
COPY --link --from=builder --chown=nextjs:nodejs /app/apps/marketing/.next/static ./apps/marketing/.next/static
 
CMD ["node", "apps/marketing/server.js"]
