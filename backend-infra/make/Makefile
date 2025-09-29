SHELL := /bin/bash
ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)
REPO_ROOT := $(abspath $(ROOT_DIR)/..)
DC := docker compose -f $(ROOT_DIR)/docker/compose/docker-compose.yml
ENV_FILE ?= .env.dev

.PHONY: up-dev up-stage up-prod down logs backup restore docs-setup docs-serve docs-build docs-lint docs-check-links docs-inventory docs-map docs-normalize-report docs-sync-modules docs-api docs-diagrams

up-dev:
	@echo "[dev] Building backend jars (assemble)"
	@cd $(REPO_ROOT) && ./gradlew -x test assemble
	@echo "[dev] Bringing up dev stack"
	ENV_FILE=.env.dev docker compose --env-file $(ROOT_DIR)/docker/compose/.env.dev \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.dev.yml \
	  --profile dev up -d --build

up-stage:
	ENV_FILE=.env.stage docker compose --env-file $(ROOT_DIR)/docker/compose/.env.stage \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.stage.yml \
	  --profile stage up -d

up-prod:
	ENV_FILE=.env.prod docker compose --env-file $(ROOT_DIR)/docker/compose/.env.prod \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.yml \
	  --profile prod up -d

down:
	docker compose \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.dev.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.stage.yml \
	  down -v

logs:
	docker compose \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.dev.yml \
	  -f $(ROOT_DIR)/docker/compose/docker-compose.override.stage.yml \
	  logs -f

.PHONY: minio-bootstrap
minio-bootstrap:
	# Re-run MinIO bootstrap job (buckets/policies)
	@echo "[infra] MinIO bootstrap using $(ENV_FILE)"
	@FILES="-f $(ROOT_DIR)/docker/compose/docker-compose.yml"; \
	  if [ "$(ENV_FILE)" = ".env.dev" ] && [ -f "$(ROOT_DIR)/docker/compose/docker-compose.override.dev.yml" ]; then \
	    FILES="$$FILES -f $(ROOT_DIR)/docker/compose/docker-compose.override.dev.yml"; \
	  fi; \
	  if [ "$(ENV_FILE)" = ".env.stage" ] && [ -f "$(ROOT_DIR)/docker/compose/docker-compose.override.stage.yml" ]; then \
	    FILES="$$FILES -f $(ROOT_DIR)/docker/compose/docker-compose.override.stage.yml"; \
	  fi; \
	  ENV_FILE=$(ENV_FILE) docker compose --env-file $(ROOT_DIR)/docker/compose/$(ENV_FILE) $$FILES run --rm minio-setup

.PHONY: minio-buckets
minio-buckets:
	@bash -lc 'set -a; source $(ROOT_DIR)/docker/compose/$(ENV_FILE); set +a; \
	  export MC_HOST_minio="http://$$MINIO_ROOT_USER:$$MINIO_ROOT_PASSWORD@minio:9000"; \
	  docker run --rm --network aquastream-net -e MC_HOST_minio minio/mc ls minio'

.PHONY: minio-put-test
minio-put-test:
	@bash -lc 'set -a; source $(ROOT_DIR)/docker/compose/$(ENV_FILE); set +a; \
	  export MC_HOST_minio="http://$$MINIO_ROOT_USER:$$MINIO_ROOT_PASSWORD@minio:9000"; \
	  FILE_PATH="$${FILE:-/tmp/minio-test.txt}"; BUCKET="$${BUCKET:-aquastream-media}"; \
	  echo "hello $$RANDOM" > "$$FILE_PATH"; \
	  docker run --rm --network aquastream-net -e MC_HOST_minio -v "$$FILE_PATH:/data/file:ro" minio/mc cp /data/file minio/$$BUCKET/$$(basename "$$FILE_PATH")'

.PHONY: minio-get-test
minio-get-test:
	@bash -lc 'FILE_PATH="$${FILE:-/tmp/minio-test.txt}"; BUCKET="$${BUCKET:-aquastream-media}"; \
	  OBJ="$${OBJ:-$$(basename "$$FILE_PATH")}"; \
	  curl -I "http://localhost:9000/$$BUCKET/$$OBJ" || true'

backup:
	bash $(ROOT_DIR)/backup/backup.sh

# Usage: make restore SCHEMA=event FILE=backend-infra/backup/artifacts/event_YYYYMMDD.dump.gz
restore:
	@if [ -z "$(SCHEMA)" ] || [ -z "$(FILE)" ]; then \
		echo "Usage: make restore SCHEMA=<schema|all> FILE=<path-to-dump.dump[.gz]>"; exit 1; \
	fi
	bash $(ROOT_DIR)/backup/restore.sh $(SCHEMA) $(FILE)

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
	  -v $(REPO_ROOT)/backend-user/backend-user-db/src/main/resources/migration/liquibase:/liquibase/changelog \
	  liquibase/liquibase:4.29 \
	  --url="jdbc:postgresql://postgres:5432/$${POSTGRES_DB:-aquastream}" \
	  --username=$${POSTGRES_USER:-aquastream} \
	  --password=$${POSTGRES_PASSWORD:-postgres} \
	  --searchPath=/liquibase/changelog \
	  --changelog-file=master.xml updateSQL | cat

liq-user-update:
	@docker run --rm --network aquastream-net \
	  -e PGPASSWORD=$${POSTGRES_PASSWORD:-postgres} \
	  -v $(REPO_ROOT)/backend-user/backend-user-db/src/main/resources/migration/liquibase:/liquibase/changelog \
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
	cd $(REPO_ROOT)/docs/docs-tools && python3 -m venv .venv-docs && \
	. .venv-docs/bin/activate && \
	pip install --upgrade pip && \
	pip install -r requirements-docs.txt

docs-serve:
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-api || $(MAKE) docs-api ; \
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-sync-modules || $(MAKE) docs-sync-modules ; \
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-diagrams || $(MAKE) docs-diagrams ; \
	cd $(REPO_ROOT)/docs/docs-tools && bash -c '. .venv-docs/bin/activate && mkdocs serve'

docs-build:
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-api || $(MAKE) docs-api ; \
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-sync-modules || $(MAKE) docs-sync-modules ; \
	$(MAKE) -f $(ROOT_DIR)/make/Makefile docs-diagrams || $(MAKE) docs-diagrams ; \
	cd $(REPO_ROOT)/docs/docs-tools && bash -c '. .venv-docs/bin/activate && mkdocs build'

docs-lint:
	@echo "[docs] markdownlint" && cd $(REPO_ROOT)/docs/docs-tools && npx --yes markdownlint-cli2 .. || true; \
	 echo "[docs] cspell" && cd $(REPO_ROOT)/docs/docs-tools && npx --yes cspell "../**/*.md" "../../../**/docs/**/*.md" --no-progress --show-context || true; \
		 echo "[docs] vale" && VBIN=$$( [ -x /opt/homebrew/bin/vale ] && echo /opt/homebrew/bin/vale || ( [ -x /usr/local/bin/vale ] && echo /usr/local/bin/vale || echo vale ) ); \
		   cd $(REPO_ROOT)/docs/docs-tools && $$VBIN .. || true; \
		 echo "[docs] lychee" && LYCHEE=$$( [ -x /opt/homebrew/bin/lychee ] && echo /opt/homebrew/bin/lychee || ( [ -x /usr/local/bin/lychee ] && echo /usr/local/bin/lychee || echo lychee ) ); \
		   cd $(REPO_ROOT)/docs/docs-tools && $$LYCHEE --config lychee.toml .. || true

docs-check-links:
	@echo "[docs] link check"
	@cd $(REPO_ROOT)/docs/docs-tools && \
	  if command -v lychee >/dev/null 2>&1; then \
	    echo "[docs] using lychee"; \
	    lychee --config lychee.toml "../**/*.md"; \
	  else \
	    echo "[docs] using Python fallback (local links only)"; \
	    python3 tools/check_links.py --base $(REPO_ROOT) --globs "../**/*.md"; \
	  fi

docs-inventory:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/inventory_md.py --repo-root $(REPO_ROOT) --csv $(REPO_ROOT)/docs/_inventory/md_inventory.csv --json $(REPO_ROOT)/docs/_inventory/md_inventory.json || \
	python3 tools/inventory_md.py --repo-root $(REPO_ROOT) --csv $(REPO_ROOT)/docs/_inventory/md_inventory.csv --json $(REPO_ROOT)/docs/_inventory/md_inventory.json

docs-map:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/map_docs.py || python3 tools/map_docs.py

.PHONY: docs-apply-map
docs-apply-map:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/apply_move_plan.py || python3 tools/apply_move_plan.py

docs-normalize-report:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/normalize_md.py || python3 tools/normalize_md.py

docs-sync-modules:
	cd $(REPO_ROOT)/docs/docs-tools && bash -c '. .venv-docs/bin/activate && python tools/centralize_md.py' || python3 tools/centralize_md.py

docs-api:
	cd $(REPO_ROOT)/docs/docs-tools && bash -c '. .venv-docs/bin/activate && python tools/generate_api_docs.py' || python3 tools/generate_api_docs.py

docs-diagrams:
	cd $(REPO_ROOT)/docs/docs-tools && bash -c '. .venv-docs/bin/activate && python tools/generate_diagrams.py' || python3 tools/generate_diagrams.py

.PHONY: deps-lock
deps-lock:
	@set -euo pipefail; \
	cd $(REPO_ROOT); \
	MODULES=$$(grep -E "^include '" settings.gradle | sed -E "s/^include '([^']+)'.*/\1/"); \
	TASKS=":dependencies"; \
	for m in $$MODULES; do TASKS="$$TASKS :$$m:dependencies"; done; \
	echo "[lock] Running: ./gradlew --no-daemon --write-locks $$TASKS"; \
	./gradlew --no-daemon --write-locks $$TASKS

.PHONY: docs-quality-report
docs-quality-report:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/check_docs_quality.py || python3 tools/check_docs_quality.py

.PHONY: docs-fix-frontmatter
docs-fix-frontmatter:
	cd $(REPO_ROOT)/docs/docs-tools && . .venv-docs/bin/activate || true; \
	python tools/quote_front_matter.py || python3 tools/quote_front_matter.py; \
	echo "Re-run Vale"; /opt/homebrew/bin/vale --config=.vale.ini --minAlertLevel=error .. || true
