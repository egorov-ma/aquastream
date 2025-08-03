# Управление версионностью в AquaStream

## Обзор

AquaStream использует централизованную систему семантического версионирования (Semantic Versioning) для обеспечения консистентности версий между всеми компонентами проекта.

## Архитектура версионирования

### Централизованное управление
```
version.properties (корень проекта)
    ↓
├── Backend (Gradle) - автоматическая синхронизация
├── Frontend (NPM) - автоматическая синхронизация  
└── Docker Images - версии из build системы
```

### Файл конфигурации: `version.properties`
```properties
version.major=1
version.minor=0
version.patch=0
version.suffix=
```

## Semantic Versioning (SemVer)

### Формат версии: `MAJOR.MINOR.PATCH[-SUFFIX]`

- **MAJOR** (1.x.x) - Breaking changes, несовместимые API изменения
- **MINOR** (x.1.x) - Новая функциональность, обратно совместимая
- **PATCH** (x.x.1) - Исправления багов, обратно совместимые
- **SUFFIX** - Дополнительные метки (alpha, beta, rc1, dev)

### Правила версионирования

#### Примеры изменения версий:
```bash
# Исправление бага
1.0.0 → 1.0.1

# Новая функциональность
1.0.1 → 1.1.0

# Breaking change
1.1.0 → 2.0.0

# Pre-release версии
1.0.0 → 1.1.0-alpha
1.1.0-alpha → 1.1.0-beta
1.1.0-beta → 1.1.0
```

## Backend (Gradle) управление версиями

### Автоматическая загрузка версии
```gradle
// build.gradle (корневой)
def versionProps = new Properties()
file("version.properties").withInputStream { 
    versionProps.load(it) 
}

def buildVersion = "${versionProps.major}.${versionProps.minor}.${versionProps.patch}"
if (versionProps.suffix && !versionProps.suffix.isEmpty()) {
    buildVersion += "-${versionProps.suffix}"
}

version = buildVersion
```

### Применение версии к субпроектам
```gradle
// Автоматическое распространение версии на все модули
subprojects {
    version = rootProject.version
}
```

### Команды сборки с версионированием
```bash
# Сборка с текущей версией
./gradlew build

# Проверка версии всех модулей
./gradlew projects

# Публикация с версией
./gradlew publishToMavenLocal
```

## Frontend (NPM) управление версиями

### Синхронизация с центральной версией
```json
// package.json
{
  "name": "aquastream-frontend",
  "version": "0.0.0-managed",
  "scripts": {
    "sync-version": "node scripts/sync-version.js",
    "prebuild": "npm run sync-version"
  }
}
```

### Скрипт синхронизации версий
```javascript
// scripts/sync-version.js
const fs = require('fs');
const path = require('path');

// Читаем version.properties
const versionProps = {};
const propsContent = fs.readFileSync('../version.properties', 'utf8');
propsContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        versionProps[key.replace('version.', '')] = value.trim();
    }
});

// Формируем версию
let version = `${versionProps.major}.${versionProps.minor}.${versionProps.patch}`;
if (versionProps.suffix) {
    version += `-${versionProps.suffix}`;
}

// Обновляем package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = version;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log(`Frontend version updated to: ${version}`);
```

### Команды управления версиями
```bash
# Синхронизация версии frontend с центральной
cd frontend
npm run sync-version

# Сборка с обновленной версией
npm run build

# Проверка текущей версии
npm version
```

## Docker Images версионирование

### Автоматическое тегирование
```dockerfile
# Версия передается как build argument
ARG APP_VERSION=latest
LABEL version=${APP_VERSION}
LABEL project="aquastream"
```

### Build команды с версионированием
```bash
# Получение версии из version.properties
VERSION=$(cat version.properties | grep -E '^version\.' | \
    awk -F= '{print $2}' | paste -sd '.' -)

# Сборка с версией
docker build --build-arg APP_VERSION=$VERSION \
    -t aquastream/backend:$VERSION .

# Тегирование latest
docker tag aquastream/backend:$VERSION aquastream/backend:latest
```

## Практические команды

### Обновление версий

#### Patch версия (исправления)
```bash
# Изменить version.patch в version.properties
sed -i 's/version.patch=.*/version.patch=1/' version.properties

# Пересобрать проект
./run.sh build
```

#### Minor версия (новая функциональность)
```bash
# Обновить version.minor, сбросить patch
sed -i 's/version.minor=.*/version.minor=1/' version.properties
sed -i 's/version.patch=.*/version.patch=0/' version.properties

./run.sh build
```

#### Major версия (breaking changes)
```bash
# Обновить version.major, сбросить minor и patch
sed -i 's/version.major=.*/version.major=2/' version.properties
sed -i 's/version.minor=.*/version.minor=0/' version.properties
sed -i 's/version.patch=.*/version.patch=0/' version.properties

./run.sh build
```

### Pre-release версии
```bash
# Добавить suffix для alpha версии
sed -i 's/version.suffix=.*/version.suffix=alpha/' version.properties

# Убрать suffix для финального релиза
sed -i 's/version.suffix=.*/version.suffix=/' version.properties
```

## Автоматизация через CI/CD

### Git hooks для версионирования
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Проверка что версия изменена при изменении кода
if git diff --cached --name-only | grep -qE '\.(java|ts|tsx|js)$'; then
    if ! git diff --cached --name-only | grep -q version.properties; then
        echo "Warning: Code changes detected but version.properties not updated"
        echo "Consider updating version before commit"
    fi
fi
```

### Release скрипт
```bash
#!/bin/bash
# scripts/create-release.sh

VERSION=$(cat version.properties | grep -E '^version\.' | \
    awk -F= '{print $2}' | paste -sd '.' -)

echo "Creating release for version: $VERSION"

# Создание git tag
git tag -a "v$VERSION" -m "Release version $VERSION"

# Сборка финальной версии
./run.sh build --full

# Опциональная публикация
echo "Release v$VERSION created successfully"
echo "To publish: git push origin v$VERSION"
```

## Проверка и валидация версий

### Команды для проверки консистентности
```bash
# Проверка версии в backend
./gradlew properties | grep version

# Проверка версии в frontend  
cd frontend && npm version

# Проверка версий Docker образов
docker images aquastream/* --format "table {{.Repository}}\t{{.Tag}}"

# Проверка через run.sh
./run.sh validate --version-check
```

### Скрипт валидации версий
```bash
#!/bin/bash
# scripts/validate-versions.sh

CENTRAL_VERSION=$(cat version.properties | grep -E '^version\.' | \
    awk -F= '{print $2}' | paste -sd '.' -)

echo "Central version: $CENTRAL_VERSION"

# Проверка backend
BACKEND_VERSION=$(./gradlew properties -q | grep "version:" | awk '{print $2}')
echo "Backend version: $BACKEND_VERSION"

# Проверка frontend
FRONTEND_VERSION=$(cd frontend && node -p "require('./package.json').version")
echo "Frontend version: $FRONTEND_VERSION"

# Сравнение версий
if [[ "$CENTRAL_VERSION" == "$BACKEND_VERSION" ]] && [[ "$CENTRAL_VERSION" == "$FRONTEND_VERSION" ]]; then
    echo "✓ All versions are consistent"
    exit 0
else
    echo "✗ Version mismatch detected"
    exit 1
fi
```

## Рекомендации и лучшие практики

### 1. Регулярное обновление версий
- Patch версии для каждого hotfix
- Minor версии для feature releases
- Major версии для breaking changes

### 2. Консистентность
- Всегда используйте централизованный version.properties
- Автоматизируйте синхронизацию версий
- Проверяйте консистентность перед релизом

### 3. Документирование изменений
```bash
# Создание CHANGELOG при обновлении версии
echo "## [${VERSION}] - $(date +%Y-%m-%d)" >> CHANGELOG.md
echo "### Added/Changed/Fixed" >> CHANGELOG.md
```

### 4. Интеграция с Git
```bash
# Автоматическое создание commit при изменении версии
git add version.properties
git commit -m "Bump version to ${VERSION}"
git tag "v${VERSION}"
```

## Troubleshooting

### Проблема: Версии не синхронизируются
```bash
# Принудительная ресинхронизация
./run.sh build --clean
cd frontend && npm run sync-version && npm run build
```

### Проблема: Docker образы с неправильными версиями
```bash
# Очистка и пересборка
docker system prune -f
./run.sh clean deep
./run.sh build --full
```

### Проблема: Git конфликты в version.properties
```bash
# Разрешение конфликтов версий
git checkout --theirs version.properties
# Затем ручная корректировка версии
```

Централизованная система версионирования обеспечивает согласованность версий между всеми компонентами AquaStream и упрощает процесс релиза.