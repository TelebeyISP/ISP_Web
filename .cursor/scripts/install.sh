#!/usr/bin/env bash
set -euo pipefail

cd /workspace

install_docker_packages() {
  if command -v docker >/dev/null 2>&1; then
    return 0
  fi
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    docker.io docker-compose-v2 fuse-overlayfs iptables
}

install_docker_packages

sudo usermod -aG docker "$USER" 2>/dev/null || true

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
fi
