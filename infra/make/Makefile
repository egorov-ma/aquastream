SHELL := /bin/bash
ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
REPO_ROOT := $(abspath $(ROOT_DIR)/..)
DC := docker compose -f $(ROOT_DIR)/docker/compose/docker-compose.yml

.PHONY: up-dev up-stage up-prod down logs backup restore docs-setup docs-serve docs-build docs-lint docs-inventory docs-map docs-normalize-report docs-sync-modules docs-api docs-diagrams

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

.PHONY: liq-user-sql liq-user-update
liq-user-sql:
	@docker run --rm --network aquastream-net \
	  -e PGPASSWORD=$${POSTGRES_PASSWORD:-postgres} \
	  -v $(ROOT_DIR)/backend-user/backend-user-db/src/main/resources/migration/liquibase:/liquibase/changelog \
	  liquibase/liquibase:4.29 \
	  --url="jdbc:postgresql://postgres:5432/$${POSTGRES_DB:-aquastream}" \
	  --username=$${POSTGRES_USER:-aquastream} \
	  --password=$${POSTGRES_PASSWORD:-postgres} \
	  --searchPath=/liquibase/changelog \
	  --changelog-file=master.xml updateSQL | cat

liq-user-update:
	@docker run --rm --network aquastream-net \
	  -e PGPASSWORD=$${POSTGRES_PASSWORD:-postgres} \
	  -v $(ROOT_DIR)/backend-user/backend-user-db/src/main/resources/migration/liquibase:/liquibase/changelog \
	  liquibase/liquibase:4.29 \
	  --url="jdbc:postgresql://postgres:5432/$${POSTGRES_DB:-aquastream}" \
	  --username=$${POSTGRES_USER:-aquastream} \
	  --password=$${POSTGRES_PASSWORD:-postgres} \
	  --searchPath=/liquibase/changelog \
	  --changelog-file=master.xml update | cat

# ------------------------------
# Docs as Code helpers
# ------------------------------
docs-setup:
	python3 -m venv .venv-docs && \
	. .venv-docs/bin/activate && \
	pip install --upgrade pip && \
	pip install -r $(REPO_ROOT)/requirements-docs.txt

docs-serve:
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-api || $(MAKE) docs-api ; \
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-sync-modules || $(MAKE) docs-sync-modules ; \
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-diagrams || $(MAKE) docs-diagrams ; \
    . .venv-docs/bin/activate && mkdocs serve

docs-build:
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-api || $(MAKE) docs-api ; \
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-sync-modules || $(MAKE) docs-sync-modules ; \
    $(MAKE) -f $(ROOT_DIR)/make/Makefile docs-diagrams || $(MAKE) docs-diagrams ; \
    . .venv-docs/bin/activate && mkdocs build

docs-lint:
	@echo "[docs] Lint placeholders (vale/cspell/lychee to be added)"

docs-inventory:
	. .venv-docs/bin/activate || true; \
	python $(REPO_ROOT)/tools/inventory_md.py --repo-root $(REPO_ROOT) --csv $(REPO_ROOT)/docs/_inventory/md_inventory.csv --json $(REPO_ROOT)/docs/_inventory/md_inventory.json || \
	python3 $(REPO_ROOT)/tools/inventory_md.py --repo-root $(REPO_ROOT) --csv $(REPO_ROOT)/docs/_inventory/md_inventory.csv --json $(REPO_ROOT)/docs/_inventory/md_inventory.json

docs-map:
	. .venv-docs/bin/activate || true; \
	python $(REPO_ROOT)/tools/map_docs.py || python3 $(REPO_ROOT)/tools/map_docs.py

docs-normalize-report:
	. .venv-docs/bin/activate || true; \
	python $(REPO_ROOT)/tools/normalize_md.py || python3 $(REPO_ROOT)/tools/normalize_md.py

docs-sync-modules:
	. .venv-docs/bin/activate || true; \
	python $(REPO_ROOT)/tools/sync_module_docs.py || python3 $(REPO_ROOT)/tools/sync_module_docs.py

docs-api:
	. .venv-docs/bin/activate || true; \
	python $(REPO_ROOT)/tools/generate_api_docs.py || python3 $(REPO_ROOT)/tools/generate_api_docs.py

docs-diagrams:
    . .venv-docs/bin/activate || true; \
    python $(REPO_ROOT)/tools/generate_diagrams.py || python3 $(REPO_ROOT)/tools/generate_diagrams.py


