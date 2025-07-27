# Common Module

Общий библиотечный модуль с DTO, утилитами и конфигурацией логирования.

Полная документация расположена в [infra/docs/common](../infra/docs/common/README.md). 

## Сборка и публикация
```bash
# Сборка JAR
./gradlew :common:build

# Публикация в локальный Maven
./gradlew :common:publishToMavenLocal
```

Добавьте зависимость в сервис:
```groovy
dependencies {
    implementation(project(":common"))
}
```

## Тестирование
```bash
./gradlew :common:test
```

## CI
![Backend CI](https://github.com/egorov-ma/aquastream/actions/workflows/backend-ci.yml/badge.svg) 