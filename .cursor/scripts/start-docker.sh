#!/usr/bin/env bash
set -euo pipefail

if docker info >/dev/null 2>&1 || sudo docker info >/dev/null 2>&1; then
  sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
  echo "Docker daemon already running"
  exit 0
fi

sudo mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
  echo '{"storage-driver":"vfs"}' | sudo tee /etc/docker/daemon.json >/dev/null
fi

# Nested Cloud Agent VMs need vfs; config lives in daemon.json (do not pass --storage-driver).
sudo pkill -x dockerd 2>/dev/null || true
sleep 1
sudo nohup dockerd >/tmp/dockerd.log 2>&1 &

for _ in $(seq 1 45); do
  if sudo docker info >/dev/null 2>&1; then
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    echo "Docker daemon ready (storage-driver=vfs)"
    exit 0
  fi
  sleep 1
done

echo "Docker daemon failed to start; see /tmp/dockerd.log"
tail -30 /tmp/dockerd.log
exit 1
