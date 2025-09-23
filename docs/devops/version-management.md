# Управление версиями

## Обзор

Проект использует централизованное управление версиями через файл `version.properties` в корне репозитория. Все модули проекта используют единую версию, определенную в этом файле.

## Структура version.properties

```properties
version.major=1
version.minor=0
version.patch=0
version.suffix=SNAPSHOT
```

### Параметры версии

- **`version.major`** — мажорная версия (breaking changes)
- **`version.minor`** — минорная версия (новый функционал, обратная совместимость)
- **`version.patch`** — патч версия (исправления багов)
- **`version.suffix`** — суффикс версии (`SNAPSHOT`, `RC1`, `BETA`, пустой для релиза)

## Формирование итоговой версии

Gradle автоматически собирает финальную версию по формуле:

```
{major}.{minor}.{patch}[-{suffix}]
```

Примеры:
- `1.0.0-SNAPSHOT` — разработческая версия
- `1.0.0-RC1` — релиз-кандидат
- `1.0.0` — финальный релиз (suffix пустой)

## Рабочие команды

### Просмотр текущей версии

```bash
# Показать версию всех модулей
./gradlew projects

# Показать только версию
grep -E "version\." version.properties
```

### Обновление версии

#### Обновление патч-версии (1.0.0 → 1.0.1)
```bash
sed -i 's/version.patch=.*/version.patch=1/' version.properties
```

#### Обновление минорной версии (1.0.0 → 1.1.0)
```bash
sed -i 's/version.minor=.*/version.minor=1/' version.properties
sed -i 's/version.patch=.*/version.patch=0/' version.properties
```

#### Обновление мажорной версии (1.0.0 → 2.0.0)
```bash
sed -i 's/version.major=.*/version.major=2/' version.properties
sed -i 's/version.minor=.*/version.minor=0/' version.properties
sed -i 's/version.patch=.*/version.patch=0/' version.properties
```

#### Изменение суффикса
```bash
# Убрать SNAPSHOT для релиза
sed -i 's/version.suffix=.*/version.suffix=/' version.properties

# Установить RC суффикс
sed -i 's/version.suffix=.*/version.suffix=RC1/' version.properties

# Вернуть SNAPSHOT после релиза
sed -i 's/version.suffix=.*/version.suffix=SNAPSHOT/' version.properties
```

## Workflow релиза

### 1. Подготовка релиза

```bash
# Убираем SNAPSHOT
sed -i 's/version.suffix=.*/version.suffix=/' version.properties

# Коммитим финальную версию
git add version.properties
git commit -m "release: bump version to $(grep version.major version.properties | cut -d'=' -f2).$(grep version.minor version.properties | cut -d'=' -f2).$(grep version.patch version.properties | cut -d'=' -f2)"

# Создаем тег
git tag "v$(grep version.major version.properties | cut -d'=' -f2).$(grep version.minor version.properties | cut -d'=' -f2).$(grep version.patch version.properties | cut -d'=' -f2)"
```

### 2. Подготовка следующей версии

```bash
# Увеличиваем минорную версию и возвращаем SNAPSHOT
sed -i 's/version.minor=.*/version.minor=$(($(grep version.minor version.properties | cut -d'=' -f2) + 1))/' version.properties
sed -i 's/version.patch=.*/version.patch=0/' version.properties
sed -i 's/version.suffix=.*/version.suffix=SNAPSHOT/' version.properties

# Коммитим следующую версию
git add version.properties
git commit -m "chore: bump version to next development iteration"
```

## Интеграция с CI/CD

### GitHub Actions

В CI workflow можно получить текущую версию:

```yaml
- name: Get version
  id: version
  run: |
    VERSION=$(./gradlew properties -q | grep "^version:" | awk '{print $2}')
    echo "version=$VERSION" >> $GITHUB_OUTPUT
```

### Docker образы

Версия автоматически передается в Docker образы:

```bash
# Gradle автоматически использует версию из version.properties
./gradlew bootBuildImage
```

## Правила версионирования

Проект следует [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** — несовместимые изменения API
- **MINOR** — новый функционал с обратной совместимостью
- **PATCH** — исправления багов с обратной совместимостью

### Примеры изменений

| Тип изменения | Версия до | Версия после |
|--------------|-----------|--------------|
| Исправление бага | 1.0.0 | 1.0.1 |
| Новая функция | 1.0.1 | 1.1.0 |
| Breaking change | 1.1.0 | 2.0.0 |
| Hotfix | 1.1.0 | 1.1.1 |

## Проверка корректности

```bash
# Проверить что версия применилась ко всем модулям
./gradlew properties | grep -E "^version:"

# Проверить что нет дублирования версий в build.gradle
grep -r "version.*=" */build.gradle || echo "OK: no hardcoded versions"
```