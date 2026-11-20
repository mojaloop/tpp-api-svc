#!/usr/bin/env bash

COMPOSE_FILE="docker-compose.yml"
trap 'docker compose -f "$COMPOSE_FILE" down -v' EXIT

wait_healthy() {
  for i in $(seq 1 30); do
    status=$(docker inspect --format='{{.State.Health.Status}}' "$1" 2>/dev/null)
    if [ "$status" = "healthy" ]; then
      echo "$1 is healthy"
      return 0
    fi
    sleep 5
  done
  echo "$1 did not become healthy"
  return 1
}

docker compose -f "$COMPOSE_FILE" up --build -d
wait_healthy tpp-api-svc || exit 1
wait_healthy mojaloop-testing-toolkit || exit 1

npm run test:int
exit_code=$?

if [ $exit_code -ne 0 ]; then
  docker compose -f "$COMPOSE_FILE" logs
fi

exit $exit_code