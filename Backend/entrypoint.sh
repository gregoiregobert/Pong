#!/bin/bash

chown -R root:root /app/Backend
chmod -R 755 /app/Backend
cd /app/Backend
# ncu -u -x node-fetch
npm install --force --legacy-peer-deps --silent
npx prisma generate
npx prisma migrate dev --name first-migration --schema='./prisma/schema.prisma' --preview-feature

exec "$@"