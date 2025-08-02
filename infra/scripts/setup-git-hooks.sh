#!/bin/bash
set -euo pipefail

# Скрипт для настройки git hooks для валидации инфраструктуры
# Устанавливает pre-commit хук для автоматической проверки изменений

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

# Проверяем, что мы в git репозитории
check_git_repo() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        log ERROR "Не git репозиторий!"
        exit 1
    fi
    log INFO "✅ Git репозиторий найден"
}

# Настраиваем git hooks директорию
setup_hooks_directory() {
    local git_dir
    git_dir=$(git rev-parse --git-dir)
    local hooks_dir="$git_dir/hooks"
    local custom_hooks_dir="$PROJECT_ROOT/.githooks"
    
    log INFO "📁 Настройка git hooks директории..."
    
    # Создаем директорию для кастомных hooks если не существует
    mkdir -p "$custom_hooks_dir"
    
    # Настраиваем git на использование нашей директории с hooks
    git config core.hooksPath "$custom_hooks_dir"
    
    log INFO "✅ Git hooks директория настроена: $custom_hooks_dir"
}

# Устанавливаем pre-commit hook
install_precommit_hook() {
    local custom_hooks_dir="$PROJECT_ROOT/.githooks"
    local precommit_hook="$custom_hooks_dir/pre-commit"
    
    log INFO "🔧 Установка pre-commit hook..."
    
    # Проверяем, существует ли уже hook
    if [ -f "$precommit_hook" ]; then
        log INFO "✅ Pre-commit hook уже существует"
        
        # Убеждаемся что он исполняемый
        chmod +x "$precommit_hook"
        
        return 0
    fi
    
    log ERROR "❌ Pre-commit hook не найден в $precommit_hook"
    log INFO "💡 Создайте файл .githooks/pre-commit или скопируйте из шаблона"
    return 1
}

# Проверяем инструменты валидации
check_validation_tools() {
    log INFO "🔍 Проверка инструментов валидации..."
    
    local missing_tools=()
    
    # Проверяем Docker
    if ! command -v docker >/dev/null 2>&1; then
        missing_tools+=("docker")
    fi
    
    # Проверяем Docker Compose
    if ! docker compose version >/dev/null 2>&1; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    # Проверяем опциональные инструменты
    local optional_tools=(
        "yq:YAML обработка"
        "shellcheck:Shell скрипты валидация"
        "hadolint:Dockerfile линтинг"
    )
    
    for tool_info in "${optional_tools[@]}"; do
        local tool_name="${tool_info%%:*}"
        local tool_desc="${tool_info##*:}"
        
        if command -v "$tool_name" >/dev/null 2>&1; then
            log INFO "✅ $tool_name установлен ($tool_desc)"
        else
            log WARN "⚠️ $tool_name не установлен ($tool_desc) - опционально"
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log ERROR "❌ Отсутствуют обязательные инструменты: ${missing_tools[*]}"
        log INFO "💡 Установите их перед использованием hooks"
        return 1
    else
        log INFO "✅ Все обязательные инструменты установлены"
        return 0
    fi
}

# Тестируем работу hooks
test_hooks() {
    log INFO "🧪 Тестирование git hooks..."
    
    # Создаем временный файл для тестирования
    local test_file="$PROJECT_ROOT/test_hook_file.tmp"
    echo "# Test file for git hooks" > "$test_file"
    
    # Добавляем в git
    git add "$test_file"
    
    # Проверяем, что pre-commit hook сработает
    if git commit --dry-run -m "Test commit for hooks" >/dev/null 2>&1; then
        log INFO "✅ Git hooks настроены корректно"
    else
        log WARN "⚠️ Возможны проблемы с git hooks конфигурацией"
    fi
    
    # Убираем тестовый файл
    git reset HEAD "$test_file" >/dev/null 2>&1 || true
    rm -f "$test_file"
}

# Создаем файл с инструкциями по установке инструментов
create_installation_guide() {
    local guide_file="$PROJECT_ROOT/infra/docs/VALIDATION_TOOLS_SETUP.md"
    
    log INFO "📖 Создание руководства по установке инструментов..."
    
    cat > "$guide_file" << 'EOF'
# Установка инструментов валидации

## Обязательные инструменты

### Docker & Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS
brew install docker docker-compose

# Windows
# Установите Docker Desktop с официального сайта
```

## Опциональные инструменты для улучшенной валидации

### yq - YAML процессор
```bash
# Linux
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq

# macOS
brew install yq

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/mikefarah/yq/releases/latest/download/yq_windows_amd64.exe" -OutFile "yq.exe"
```

### shellcheck - Валидация shell скриптов
```bash
# Ubuntu/Debian
sudo apt-get install shellcheck

# CentOS/RHEL/Fedora
sudo dnf install shellcheck

# macOS
brew install shellcheck

# Windows
# Используйте WSL или установите через Chocolatey:
# choco install shellcheck
```

### hadolint - Линтер для Dockerfile
```bash
# Linux
sudo wget -qO /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
sudo chmod +x /usr/local/bin/hadolint

# macOS
brew install hadolint

# Windows
# Скачайте hadolint-Windows-x86_64.exe с GitHub releases
```

## Проверка установки

После установки инструментов проверьте их работу:

```bash
# Проверка основных инструментов
docker --version
docker compose version

# Проверка опциональных инструментов
yq --version
shellcheck --version
hadolint --version
```

## Автоматическая установка (Linux/macOS)

Выполните скрипт для автоматической установки:

```bash
./infra/scripts/install-validation-tools.sh
```

## Использование в CI/CD

Все инструменты автоматически устанавливаются в GitHub Actions workflows.
Для других CI/CD систем используйте соответствующие команды установки.
EOF

    log INFO "✅ Руководство создано: $guide_file"
}

# Основная функция
main() {
    log INFO "🚀 Настройка git hooks для валидации инфраструктуры AquaStream"
    log INFO "📂 Проект: $PROJECT_ROOT"
    echo
    
    # Проверяем git репозиторий
    check_git_repo
    
    # Настраиваем hooks директорию
    setup_hooks_directory
    
    # Устанавливаем pre-commit hook
    if ! install_precommit_hook; then
        log WARN "⚠️ Pre-commit hook не установлен"
    fi
    
    # Проверяем инструменты валидации
    check_validation_tools
    
    # Тестируем hooks
    test_hooks
    
    # Создаем руководство по установке
    create_installation_guide
    
    echo
    log INFO "🎉 Настройка git hooks завершена!"
    echo
    log INFO "📋 Что было настроено:"
    log INFO "  • Git hooks directory: .githooks/"
    log INFO "  • Pre-commit validation hook"
    log INFO "  • Проверка инструментов валидации"
    echo
    log INFO "💡 Как использовать:"
    log INFO "  • Hooks срабатывают автоматически при git commit"
    log INFO "  • Для пропуска: git commit --no-verify (не рекомендуется)"
    log INFO "  • Ручная валидация: ./infra/scripts/validate-infrastructure.sh"
    echo
    log INFO "⚙️ Настройка для команды:"
    log INFO "  • Каждый разработчик должен запустить: ./infra/scripts/setup-git-hooks.sh"
    log INFO "  • Установить инструменты валидации (см. infra/docs/VALIDATION_TOOLS_SETUP.md)"
}

# Показать справку
show_help() {
    echo "AquaStream Git Hooks Setup"
    echo "========================="
    echo ""
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  --help, -h          Показать эту справку"
    echo "  --check-only        Только проверить текущие настройки"
    echo "  --uninstall         Удалить git hooks"
    echo ""
    echo "Этот скрипт настраивает git hooks для автоматической валидации"
    echo "инфраструктурных файлов при коммитах."
    echo ""
}

# Обработка аргументов
case "${1:-}" in
    "--help"|"-h")
        show_help
        exit 0
        ;;
    "--check-only")
        log INFO "🔍 Проверка текущих настроек git hooks..."
        check_git_repo
        check_validation_tools
        if [ -f "$PROJECT_ROOT/.githooks/pre-commit" ]; then
            log INFO "✅ Pre-commit hook установлен"
        else
            log WARN "⚠️ Pre-commit hook не найден"
        fi
        ;;
    "--uninstall")
        log INFO "🗑️ Удаление git hooks..."
        git config --unset core.hooksPath || true
        log INFO "✅ Git hooks отключены"
        ;;
    "")
        main
        ;;
    *)
        log ERROR "Неизвестная опция: $1"
        show_help
        exit 1
        ;;
esac