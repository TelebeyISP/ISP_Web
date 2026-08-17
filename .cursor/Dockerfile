FROM ubuntu:24.04

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       ca-certificates curl git gnupg sudo \
       docker.io docker-compose-v2 \
       fuse-overlayfs iptables \
    && rm -rf /var/lib/apt/lists/* \
    && echo '{"storage-driver":"vfs"}' > /etc/docker/daemon.json

# Cloud Agent runs as ubuntu; allow passwordless dockerd for nested VMs.
RUN echo 'ubuntu ALL=(ALL) NOPASSWD: /usr/bin/dockerd, /usr/bin/docker, /usr/bin/apt-get, /usr/bin/tee, /usr/bin/mkdir' \
    > /etc/sudoers.d/docker-ubuntu \
    && chmod 440 /etc/sudoers.d/docker-ubuntu

USER ubuntu
WORKDIR /workspace
