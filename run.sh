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

build_containers() {
  if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created $ENV_FILE from example."
  fi
  for dir in backend-*/backend-*-service; do
    svc=$(basename "$dir" | sed 's/backend-//; s/-service$//')
    image="aquastream-${svc}-service"
    if [ "$svc" = "gateway" ]; then
      image="aquastream-api-gateway"
    fi
    run_cmd docker build -f infra/docker/images/Dockerfile.backend --build-arg SERVICE="$dir" -t "$image" .
  done
  run_cmd docker build -f infra/docker/images/Dockerfile.frontend -t aquastream-frontend .
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
        build_containers
        ;;
      "")
        run_cmd ./gradlew build
        run_cmd npm --prefix frontend ci
        run_cmd npm --prefix frontend run build
        build_containers
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
  check)
    case "$2" in
      -be)
        run_cmd ./gradlew check
        ;;
      -fe)
        run_cmd npm --prefix frontend run lint
        run_cmd npm --prefix frontend test
        ;;
      "")
        run_cmd ./gradlew check
        run_cmd npm --prefix frontend run lint
        run_cmd npm --prefix frontend test
        ;;
      *)
        echo "Usage: $0 check [-be|-fe]"
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
    if [ ! -f "$ENV_FILE" ]; then
      cp "$ENV_EXAMPLE" "$ENV_FILE"
      echo "Created $ENV_FILE from example."
    fi
    if [ "$2" = "--no-build" ]; then
      run_cmd docker compose -f "$COMPOSE_FILE" up -d
    else
      run_cmd docker compose -f "$COMPOSE_FILE" up -d --build
    fi
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
    echo "Usage: $0 {build|test|lint|check|dev|start|stop|restart|status|logs} [-be|-fe|-docker|--no-build]"
    exit 1
    ;;

esac
