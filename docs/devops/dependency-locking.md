# Dependency Locking

Gradle Dependency Locking обеспечивает воспроизводимые сборки путем фиксации точных версий всех зависимостей.

## Настройка

Автоматически включено для всех модулей в `build.gradle`:

```groovy
subprojects {
    dependencyLocking {
        lockAllConfigurations()
        lockMode = org.gradle.api.artifacts.dsl.LockMode.STRICT
    }
}
```

## Файлы lockfile

Каждый модуль содержит `gradle.lockfile` с зафиксированными версиями:

```
backend-common/gradle.lockfile
backend-user/gradle.lockfile
backend-event/gradle.lockfile
...
```

## Команды

### Обновление lockfile

```bash
# Обновить конкретный модуль
./gradlew :backend-common:dependencies --write-locks

# Обновить все модули (рекомендуется)
make deps-lock

# Альтернатива (ручной вариант)
./gradlew dependencies --write-locks

# Обновить только рабочие конфигурации
./gradlew :backend-common:compileClasspath --write-locks
```

### Анализ зависимостей

```bash
# Просмотр дерева зависимостей
./gradlew :backend-common:dependencies

# Анализ конкретной зависимости
./gradlew :backend-common:dependencyInsight --dependency spring-boot-starter

# Поиск конфликтов версий
./gradlew :backend-common:dependencyInsight --dependency jackson-core
```

### Проверка актуальности

```bash
# Проверить устаревшие зависимости
./gradlew dependencyUpdates

# Проверить соответствие lockfile
./gradlew build
```

## Когда обновлять

1. **При добавлении новых зависимостей** в `build.gradle`
2. **При обновлении версий** Spring Boot или других библиотек
3. **При security updates** критических зависимостей
4. **Периодически** для получения bug fixes

## Процесс обновления

1. Изменить версию в `build.gradle`
2. Запустить `./gradlew dependencies --write-locks`
3. Проверить изменения в `gradle.lockfile`
4. Протестировать сборку: `./gradlew build`
5. Закоммитить изменения

## Troubleshooting

### Ошибка "Dependency lock state"

```bash
# Принудительно обновить lockfile
./gradlew dependencies --write-locks --refresh-dependencies
```

### Конфликты после обновления

```bash
# Очистить кэш и пересобрать
./gradlew clean build --refresh-dependencies
```

### Откат изменений

```bash
# Восстановить из Git
git checkout HEAD -- */gradle.lockfile
```

## CI/CD интеграция

В `Backend CI` настроен отдельный job `Lock Check`, который:
- Генерирует lock-файлы для всех модулей без сборки (`:dependencies --write-locks`)
- Проверяет, что `gradle.lockfile` не изменились
- В случае расхождений — падает с подсказкой: запустить `make deps-lock` и закоммитить изменения

Это гарантирует воспроизводимость версий в PR и на ветке `main`.
