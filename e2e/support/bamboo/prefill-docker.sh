#!/bin/bash

# Run docker-compose in detached mode
docker-compose -f docker-compose-no-volumes.yml up -d

# Wait for the backend to start
while [ "$(curl -s -o /dev/null -w ''%{http_code}'' http://localhost:9000/openmrs/login.htm)" != "200" ]; do
  echo "Waiting for the backend to be up..."
  sleep 10
done

# Get the container IDs
backend_container_id=$(docker ps --filter "ancestor=openmrs/openmrs-reference-application-3-backend:nightly" --format "{{.ID}}")
db_container_id=$(docker ps --filter "ancestor=mariadb:10.8.2" --format "{{.ID}}")

# Commit the containers as snapshots
docker commit "$backend_container_id" openmrs-backend-snapshot
docker commit "$db_container_id" openmrs-db-snapshot

# Tag the containers
docker tag openmrs-db-snapshot piumal1999/openmrs-reference-application-3-db-amd64:nightly-with-data
docker tag openmrs-backend-snapshot piumal1999/openmrs-reference-application-3-backend-amd64:nightly-with-data

# Push the images
docker push piumal1999/openmrs-reference-application-3-db-amd64:nightly-with-data
docker push piumal1999/openmrs-reference-application-3-backend-amd64:nightly-with-data

# Stop all services
echo "Stopping all services..."
docker-compose -f docker-compose-no-volumes.yml down
