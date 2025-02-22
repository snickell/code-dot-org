# Development with Docker

## Features

* Run development server requirements such as MySQL and Redis in containers.

## Running a Native Dashboard Server

If you want to run the server code natively, but leverage Docker to run the dependent
services, you can follow these instructions.

First, install docker using [the instructions below](#installing-docker). Then follow the
normal [SETUP.md](../../SETUP.md) instructions for your platform.  You can skip over many
steps that are related to running MySQL and Redis.

> **Note**
>
> If you are already running MySQL and/or Redis natively, you may depending on your
> operating system need to stop those services or the `docker compose run` command below
> will fail due to in-use ports.
>
> On Linux, that will likely be:
>
> ```shell
> sudo systemctl stop mysql
> sudo systemctl stop redis
> ```
>
> On MacOS, that will likely be:
>
> ```shell
> brew services stop mysql@8.0
> brew services stop redis
> ```

Once you have a working Ruby and Node environment, you can then use this command to spin
up the database and Redis servers:

```shell
docker compose run dashboard-services
```

This will tell you which items you will need to place in your `locals.yml` file for the
server to connect to the contained database.

Just copy those lines into your `locals.yml` and start your Dashboard server as normal via:

```shell
./bin/dashboard-server
```

## Installing Docker

Our Docker development environment requires at least [Docker
Compose](https://docs.docker.com/compose/) version 2.23 or higher, as well as a compatible
installation of [Docker Engine](https://docs.docker.com/engine/). If you'd like a GUI
interface and a one-click installation process, consider [Docker
Desktop](https://docs.docker.com/desktop/) as an optional alternative to manual
installation.

### Official Installation Instructions

The official documentation for each service will be the most up-to-date and
officially-supported way to install each service, but may not cover every edge case for
your local development environment:

- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Docker Desktop ([Mac](https://docs.docker.com/desktop/setup/install/mac-install/),
  [Windows](https://docs.docker.com/desktop/setup/install/windows-install/),
  [Linux](https://docs.docker.com/desktop/setup/install/linux/))

Alternatively, consider consulting your package management for your OS.

### Code.org Installation Instructions

Below are installation steps which have worked for other code.org engineers to install the
specific requirements needed for our setup. See the appropriate section below:
[macOS](#macos), [Ubuntu](#ubuntu), [Windows](#windows)

### macOS

> **Note**
>
> Mac support is currently limited; in part because of the performance issues when trying
> to run our stack within the hypervisor that MacOS runs docker inside of, in part because
> of the architectural differences between different Apple chips, and in part because of
> the lack of test devices among developers who have worked on this so far.

1. Install Docker itself:
   ```shell
   brew install docker
   ```

1. Install Docker Compose:
   ```shell
   export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
   mkdir -p $DOCKER_CONFIG/cli-plugins
   curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-darwin-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
   chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
   ```

1. Install Colima as a container runtime:
   ```shell
   brew install colima
   ```

1. Start the Colima service (and have it start on login)
   ```shell
   brew services start colima
   ```

### Ubuntu

1. Open a terminal.

1. Install Docker via `apt`:
   ```shell
   sudo apt update && sudo apt install docker.io
   ```

1. Enable and start the Docker service
   ```shell
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

1. Give your account privileges to run Docker
   ```shell
   sudo usermod -aG docker ${USER}
   ```

1. Install Docker Compose:
   ```shell
   export DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
   mkdir -p $DOCKER_CONFIG/cli-plugins
   curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-$(uname -m) -o $DOCKER_CONFIG/cli-plugins/docker-compose
   chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
   ```

### Windows

Docker on Windows is facilitated with the Docker Desktop application, which you can find
[here](https://www.docker.com/products/docker-desktop/).

When you install that, you will need to follow the instructions in that app to enable
Docker, which may require updating some system settings. There are other instructions
found [here](https://docs.docker.com/desktop/install/windows-install/) that may help.

1. Install Docker Desktop from [here](https://www.docker.com/products/docker-desktop/).
   Using instructions found
   [here](https://docs.docker.com/desktop/install/windows-install/).

1. Start Docker Desktop. It will say "Engine running" in the lower-left corner of the
   Docker Desktop window.

1. Start your WSL Ubuntu session.

## Verifying Successful Installation

Once Docker with Docker Compose has been installed:

1. Verify Docker works without root (you may need to restart your terminal session):
   ```shell
   docker run --rm hello-world
   ```

1. Verify Docker Compose version is at least 2.23.
   ```shell
   docker compose version
   ```
