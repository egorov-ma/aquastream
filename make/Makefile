SHELL := /bin/bash
ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
DC := docker compose -f $(ROOT_DIR)/infra/docker/compose/docker-compose.yml

.PHONY: up-dev up-stage up-prod down logs backup restore

up-dev:
	$(DC) --profile dev up -d

up-stage:
	$(DC) --profile stage up -d

up-prod:
	$(DC) --profile prod up -d

down:
	$(DC) down -v

logs:
	$(DC) logs -f

backup:
	bash $(ROOT_DIR)/infra/backup/backup.sh

# Usage: make restore SCHEMA=event FILE=infra/backup/artifacts/event_YYYYMMDD.dump
restore:
	@if [ -z "$(SCHEMA)" ] || [ -z "$(FILE)" ]; then \
		echo "Usage: make restore SCHEMA=<schema|all> FILE=<path-to-dump.dump>"; exit 1; \
	fi
	bash $(ROOT_DIR)/infra/backup/restore.sh $(SCHEMA) $(FILE)

.PHONY: ps smoke
ps:
	$(DC) --profile stage ps

smoke:
	@echo "[smoke] Checking gateway health..."; \
	curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/actuator/health | grep -q '^200$' && echo "OK" || (echo "Gateway health not 200" && exit 1)


