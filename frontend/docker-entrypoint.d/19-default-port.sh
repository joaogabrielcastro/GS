#!/bin/sh
set -e
if [ -z "${PORT:-}" ]; then
  export PORT=80
fi
