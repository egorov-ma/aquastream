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
      "")
        run_cmd ./gradlew build
        run_cmd npm --prefix frontend ci
        run_cmd npm --prefix frontend run build
        ;;
      *)
        echo "Usage: $0 build [-be|-fe]"
        exit 1
        ;;
    esac
    ;;
  test)
    case "$2" in
      -be)
        run_cmd ./gradlew test
        ;;
      -fe)
        run_cmd npm --prefix frontend test
        ;;
      "")
        run_cmd ./gradlew test
        run_cmd npm --prefix frontend test
        ;;
      *)
        echo "Usage: $0 test [-be|-fe]"
        exit 1
        ;;
    esac
    ;;
  lint)
    case "$2" in
      -be)
        run_cmd ./gradlew check
        ;;
      -fe)
        run_cmd npm --prefix frontend run lint
        ;;
      "")
        run_cmd ./gradlew check
        run_cmd npm --prefix frontend run lint
        ;;
      *)
        echo "Usage: $0 lint [-be|-fe]"
        exit 1
        ;;
    esac
    ;;
  start)
    if [ ! -f "$ENV_FILE" ]; then
      cp "$ENV_EXAMPLE" "$ENV_FILE"
      echo "Created $ENV_FILE from example."
    fi
    run_cmd docker compose -f "$COMPOSE_FILE" up -d
    ;;
  stop)
    run_cmd docker compose -f "$COMPOSE_FILE" down -v
    ;;
  restart)
    run_cmd "$0" stop
    run_cmd "$0" start
    ;;
  status)
    run_cmd docker compose -f "$COMPOSE_FILE" ps
    ;;
  logs)
    run_cmd docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  *)
    echo "Usage: $0 {build|test|lint|start|stop|restart|status|logs} [-be|-fe]"
    exit 1
    ;;

esac
