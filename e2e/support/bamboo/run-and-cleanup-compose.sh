#!/bin/bash

# Run Docker Compose up in detached mode
docker compose up -d

# Wait for the 'tests' container to start
while [ "$(docker ps -a -f 'name=my-playwright-tests-container' -f 'status=created' -q)" != "" ]; do
  echo "Waiting for tests to start..."
  sleep 10
done

# Wait for the 'tests' container to finish
while [ "$(docker ps -a -f 'name=my-playwright-tests-container' -f 'status=running' -q)" != "" ]; do
  echo "Waiting for tests to finish..."
  sleep 10
done

# Stop all services
echo "Stopping all services..."
docker compose down
