#!/bin/bash

export E2E_BASE_URL=http://gateway/openmrs
export CI=true

timeout=$((SECONDS + 900))  # Timeout after 15 minutes (900 seconds)

yarn install --immutable

while [ "$(curl -s -o /dev/null -w ''%{http_code}'' http://gateway/openmrs/login.htm)" != "200" ]; do
  echo "Waiting for the backend to be up..."
  sleep 10

  if [ $SECONDS -gt $timeout ]; then
    echo "Timeout reached. The backend did not become available within 15 minutes."
    exit 1
  fi
done

yarn test-e2e
