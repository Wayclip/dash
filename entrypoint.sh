#!/bin/sh
set -e

for var in $(env | grep '^NEXT_PUBLIC_' | cut -d= -f1); do
  sed -i "s|\${$var}|${!var}|g" /app/.next/standalone/server.js
done

exec "$@"
