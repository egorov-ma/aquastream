#!/bin/bash
set -euo pipefail

# Скрипт для настройки политик управления жизненным циклом индексов (ILM)
# в Elasticsearch для централизованного логирования

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Цвета для вывода
NC="\033[0m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"

log() {
    local level="$1"; shift
    local msg="$*"
    local color="$GREEN"
    case "$level" in
      INFO)  color="$GREEN";;
      WARN)  color="$YELLOW";;
      ERROR) color="$RED";;
    esac
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${color}${level}${NC} ${msg}"
}

# Проверяем, что Elasticsearch доступен
check_elasticsearch() {
    local max_attempts=30
    local attempt=1
    
    log INFO "Проверка доступности Elasticsearch..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -k --cacert "${PROJECT_ROOT}/infra/monitoring/elasticsearch/certs/ca/ca.crt" \
                -u "elastic:${ELASTIC_PASSWORD}" \
                "https://localhost:9200/_cluster/health" | grep -q '"status"'; then
            log INFO "Elasticsearch доступен"
            return 0
        fi
        
        log WARN "Elasticsearch недоступен (попытка $attempt/$max_attempts), ожидание 5s..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log ERROR "Elasticsearch недоступен после $max_attempts попыток!"
    return 1
}

# Применяем политику ILM
apply_ilm_policy() {
    local policy_name="$1"
    local policy_json="$2"
    
    log INFO "Применение политики ILM: $policy_name"
    
    local response
    response=$(curl -s -k --cacert "${PROJECT_ROOT}/infra/monitoring/elasticsearch/certs/ca/ca.crt" \
                -u "elastic:${ELASTIC_PASSWORD}" \
                -X PUT "https://localhost:9200/_ilm/policy/$policy_name" \
                -H "Content-Type: application/json" \
                -d "$policy_json")
    
    if echo "$response" | grep -q '"acknowledged":true'; then
        log INFO "✅ Политика $policy_name успешно применена"
    else
        log ERROR "❌ Ошибка применения политики $policy_name: $response"
        return 1
    fi
}

# Создаем алиасы для индексов
create_index_alias() {
    local alias_name="$1"
    local index_pattern="$2"
    
    log INFO "Создание алиаса $alias_name для паттерна $index_pattern"
    
    local response
    response=$(curl -s -k --cacert "${PROJECT_ROOT}/infra/monitoring/elasticsearch/certs/ca/ca.crt" \
                -u "elastic:${ELASTIC_PASSWORD}" \
                -X PUT "https://localhost:9200/${index_pattern}-000001" \
                -H "Content-Type: application/json" \
                -d "{
                  \"settings\": {
                    \"number_of_shards\": 1,
                    \"number_of_replicas\": 0,
                    \"index.lifecycle.name\": \"${alias_name}-policy\",
                    \"index.lifecycle.rollover_alias\": \"${alias_name}\"
                  },
                  \"aliases\": {
                    \"${alias_name}\": {
                      \"is_write_index\": true
                    }
                  }
                }")
    
    if echo "$response" | grep -q '"acknowledged":true'; then
        log INFO "✅ Алиас $alias_name успешно создан"
    else
        log WARN "⚠️  Алиас $alias_name уже существует или произошла ошибка: $response"
    fi
}

# Загружаем переменные окружения
if [ -f "${PROJECT_ROOT}/infra/docker/compose/.env" ]; then
    source "${PROJECT_ROOT}/infra/docker/compose/.env"
else
    log ERROR "Файл .env не найден в ${PROJECT_ROOT}/infra/docker/compose/"
    exit 1
fi

# Проверяем, что задан пароль Elasticsearch
if [ -z "${ELASTIC_PASSWORD:-}" ]; then
    log ERROR "Переменная ELASTIC_PASSWORD не задана в .env файле"
    exit 1
fi

# Проверяем доступность Elasticsearch
check_elasticsearch

log INFO "Настройка политик управления жизненным циклом индексов..."

# Читаем и применяем политики из JSON файла
POLICIES_FILE="${PROJECT_ROOT}/infra/monitoring/elasticsearch/ilm-policies.json"

if [ ! -f "$POLICIES_FILE" ]; then
    log ERROR "Файл с политиками не найден: $POLICIES_FILE"
    exit 1
fi

# Применяем политику для обычных логов
LOG_POLICY=$(jq -r '.["aquastream-log-policy"]' "$POLICIES_FILE")
apply_ilm_policy "aquastream-log-policy" "$LOG_POLICY"

# Применяем политику для логов безопасности
SECURITY_POLICY=$(jq -r '.["aquastream-security-policy"]' "$POLICIES_FILE")
apply_ilm_policy "aquastream-security-policy" "$SECURITY_POLICY"

# Создаем алиасы для индексов
create_index_alias "aquastream-logs" "aquastream-logs"
create_index_alias "aquastream-security" "aquastream-security"

log INFO "✅ Настройка централизованного логирования завершена!"
log INFO ""
log INFO "📊 Политики хранения:"
log INFO "  • Обычные логи: 90 дней (hot 7d → warm 30d → cold 90d → delete)"
log INFO "  • Логи безопасности: 365 дней (hot 30d → warm 90d → cold 365d → delete)"
log INFO ""
log INFO "🔍 Доступ к логам:"
log INFO "  • Kibana: https://localhost/monitoring/kibana/"
log INFO "  • Индекс приложений: aquastream-logs-*"
log INFO "  • Индекс безопасности: aquastream-security-*"