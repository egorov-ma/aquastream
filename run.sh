#!/usr/bin/env bash
set -e

COMPOSE_FILE="infra/docker/compose/docker-compose.dev.yml"
ENV_DIR="infra/docker/compose"
ENV_FILE="$ENV_DIR/.env"
ENV_EXAMPLE="$ENV_DIR/.env.example"

COLOR="\033[1;36m"
RESET="\033[0m"

run_cmd() {
  echo -e "${COLOR}$*${RESET}"
  "$@"
}

ensure_env() {
  if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created $ENV_FILE from example."
  fi
}

case "$1" in
  build)
    case "$2" in
      -be)
        run_cmd ./gradlew build
        ;;
      -fe)
        run_cmd npm --prefix frontend ci
        run_cmd npm --prefix frontend run build
        ;;
      -docker)
        ensure_env
        run_cmd docker compose -f "$COMPOSE_FILE" build
        ;;
      "")
        run_cmd ./gradlew build
        run_cmd npm --prefix frontend ci
        run_cmd npm --prefix frontend run build
        ensure_env
        run_cmd docker compose -f "$COMPOSE_FILE" build
        ;;
      *)
        echo "Usage: $0 build [-be|-fe|-docker]"
        exit 1
        ;;
    esac
    ;;
  test)
    case "$2" in
      -be)
        run_cmd ./gradlew check
        run_cmd ./gradlew test
        ;;
      -fe)
        run_cmd npm --prefix frontend run lint
        run_cmd npm --prefix frontend test
        ;;
      "")
        run_cmd ./gradlew check
        run_cmd ./gradlew test
        run_cmd npm --prefix frontend run lint
        run_cmd npm --prefix frontend test
        ;;
      *)
        echo "Usage: $0 test [-be|-fe]"
        exit 1
        ;;
    esac
    ;;
  dev)
    case "$2" in
      -be)
        run_cmd ./gradlew bootRun
        ;;
      -fe)
        run_cmd npm --prefix frontend start
        ;;
      *)
        echo "Usage: $0 dev [-be|-fe]"
        exit 1
        ;;
    esac
    ;;
  start)
    ensure_env
    run_cmd docker compose -f "$COMPOSE_FILE" up -d
    ;;
  stop)
    run_cmd docker compose -f "$COMPOSE_FILE" down -v
    ;;
  status)
    run_cmd docker compose -f "$COMPOSE_FILE" ps
    ;;
  logs)
    run_cmd docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  *)
    echo "Usage: $0 {build|test|dev|start|stop|status|logs} [-be|-fe|-docker]"
    exit 1
    ;;
 esac
