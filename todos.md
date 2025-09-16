# AquaStream Gradle Build Optimization - Action Plan

## Статус проекта
- **Версия проекта**: 1.0.0-SNAPSHOT
- **Java версия**: 21
- **Spring Boot версия**: 3.3.5
- **Всего Gradle файлов**: 26
- **Микросервисы**: 6 (user, event, crew, media, payment, notification)
- **Общие модули**: backend-common (библиотека), backend-gateway (API Gateway)
- **Frontend**: Next.js приложение (отдельная экосистема)
- **Инфраструктура**: docker, backup scripts, documentation (без Gradle конфигурации)

## Анализ текущего состояния

### ✅ Положительные стороны
- Хорошая многомодульная структура с разделением api/service/db
- Использование современных версий Java 21 и Spring Boot 3.3.5
- Последовательное использование общего модуля backend-common
- Интеграция OWASP dependency check
- Стандартизированное использование Lombok и JUnit 5

### ❌ Критические проблемы
- **Конфликты версий зависимостей** (JWT, Bucket4j, Hypersistence Utils)
- **Дублирование зависимостей** между модулями (PostgreSQL, Jackson, Lombok)
- **Несогласованная конфигурация jar/bootJar** для библиотечных vs исполняемых модулей
- **Отсутствие централизованного управления версиями** (частично есть в root, но не все используется)
- **Неэффективное использование BOM** (отсутствует Testcontainers BOM, Jackson BOM)
- **Проблемы backend-common**: избыточные api зависимости вместо implementation
- **Проблемы backend-gateway**: дублирование security и JSON зависимостей с backend-common
- **Отсутствие gradle.properties** для оптимизации сборки
- **Устаревшая версия Gradle Wrapper** (может влиять на производительность)
- **Отсутствие task input/output optimization** (incremental compilation)
- **Неоптимизированная структура build.gradle** (отсутствие Convention Plugins)
- **Отсутствие configuration cache** настроек
- **Неэффективная стратегия тестирования** (параллельное выполнение тестов)

---

## План действий по приоритетам

## 🔴 КРИТИЧЕСКИЙ ПРИОРИТЕТ

### 1. Устранение конфликтов версий зависимостей
**Задача**: Привести все версии зависимостей к единому стандарту

**Проблемы**:
- JWT библиотеки: Gateway (0.12.6) vs User-service (0.12.5 из root)
- Bucket4j: backend-common (8.7.0) vs gateway (8.10.1)
- Hypersistence Utils: event-db (3.6.0) vs crew-db, media-db (3.5.1)
- SpringDoc OpenAPI: модули используют 2.3.0, root определяет 2.6.0 (не используется)

**Шаги**:
1. ✅ Провести аудит всех версий зависимостей
2. 📝 Определить актуальные стабильные версии для каждой библиотеки
3. 🔧 Обновить root build.gradle с централизованными версиями:
   ```groovy
   ext {
       jwtVersion = '0.12.6'           // Обновить с 0.12.5
       bucket4jVersion = '8.10.1'      // Новая переменная
       hypersistenceVersion = '3.6.0'  // Обновить с 3.5.1
       springdocVersion = '2.6.0'      // Уже есть, но не используется
   }
   ```
4. 🔧 Применить единые версии во всех модулях, удалив хардкодные версии
5. 🧪 Запустить тесты для проверки совместимости

**Ожидаемый результат**: Отсутствие конфликтов версий, стабильная работа всех модулей

### 2. Устранение дублирования зависимостей
**Задача**: Убрать избыточные объявления зависимостей

**Проблемы**:
- **backend-common**: избыточные `api` зависимости (Jackson, Security) должны быть `implementation`
- **backend-gateway**: дублирует Security и WebFlux с backend-common
- **PostgreSQL** объявлен и глобально, и в отдельных модулях
- **Jackson databind** явно объявлен в backend-common и других модулях
- **Lombok** объявлен глобально и индивидуально
- **SpringDoc OpenAPI** разные версии в разных модулях

**Шаги**:
1. 🔍 Создать карту всех дублированных зависимостей по модулям
2. 🔧 **Оптимизировать backend-common**:
   ```groovy
   // Изменить api на implementation для внутренних зависимостей
   implementation 'org.springframework.boot:spring-boot-starter-security'
   implementation 'com.fasterxml.jackson.core:jackson-databind'
   // Оставить api только для того, что должно экспортироваться
   api 'org.springframework.boot:spring-boot-starter-validation'
   ```
3. 🔧 **Упростить backend-gateway**:
   - Удалить дублирующие security зависимости (уже есть в backend-common)
   - Удалить дублирующие JSON зависимости
4. 🔧 Удалить избыточные объявления из service модулей:
   - PostgreSQL (наследуется от db модулей)
   - Lombok (уже глобально)
5. 🧪 Проверить корректность сборки всех модулей
6. 📋 Создать документацию по принципам наследования зависимостей

**Ожидаемый результат**: Уменьшение размера конфигурации на 40-50%, четкое разделение api/implementation

### 3. Устранение критической совместимости Gradle 8.5 + Spring Boot 3.3.5
**Задача**: Исправить известный конфликт commons-compress, который может привести к сбою сборки

**Критическая проблема**: Конфликт Apache commons-compress между Gradle 8.5 и Spring Boot 3.3.5
- Возникает `NoSuchMethodError` при выполнении `bootJar` task
- Вызван изменением сигнатуры методов в commons-compress
- Может полностью заблокировать сборку проекта

**Шаги**:
1. 🔧 **Добавить resolution strategy в root build.gradle** (ПЕРЕД plugins):
   ```groovy
   buildscript {
       configurations.all {
           resolutionStrategy {
               force "org.apache.commons:commons-compress:1.26.2"
           }
       }
   }
   ```

2. 🔧 **Проверить конфликтующие зависимости**:
   ```bash
   ./gradlew buildEnvironment
   ./gradlew dependencyInsight --dependency commons-compress
   ```

3. 🔧 **Альтернативно: добавить в buildSrc/build.gradle** (если есть buildSrc):
   ```groovy
   dependencies {
       implementation "org.apache.commons:commons-compress:1.26.2"
   }
   ```

4. 🧪 **Протестировать сборку всех модулей**:
   ```bash
   ./gradlew clean build
   ./gradlew bootJar
   ```

**Ожидаемый результат**: Устранение потенциальных сбоев сборки, стабильная работа bootJar tasks

### 4. Стандартизация конфигурации jar/bootJar
**Задача**: Привести конфигурацию артефактов к единому стандарту

**Проблема**: Несогласованная обработка jar и bootJar между библиотечными и исполняемыми модулями

**Шаги**:
1. 🔧 Добавить в root build.gradle стандартную конфигурацию:
   ```groovy
   // Для библиотечных модулей (db, service)
   configure(subprojects.findAll { 
       it.name.endsWith('-db') || it.name.endsWith('-service') 
   }) {
       jar { 
           enabled = true 
           archiveClassifier = '' 
       }
       bootJar { enabled = false }
   }
   
   // Для исполняемых модулей (api)
   configure(subprojects.findAll { it.name.endsWith('-api') }) {
       jar { enabled = false }
       bootJar { enabled = true }
   }
   ```
2. 🗑️ Удалить дублирующие конфигурации из индивидуальных модулей
3. 🧪 Протестировать сборку всех модулей

**Ожидаемый результат**: Единообразная сборка артефактов, отсутствие конфликтов при публикации

---

## 🟠 ВЫСОКИЙ ПРИОРИТЕТ

### 5. Централизация управления версиями
**Задача**: Создать единую систему управления версиями всех зависимостей

**Текущее состояние**: В root build.gradle уже есть много версий в ext блоке, но не все используются

**Шаги**:
1. 🔧 Дополнить существующий раздел ext в root build.gradle недостающими версиями:
   ```groovy
   ext {
       // Уже есть большинство версий, добавить:
       bucket4jVersion = '8.10.1'         // Новое
       hypersistenceVersion = '3.6.0'     // Новое  
       hibernateTypesVersion = '2.21.1'   // Новое
       minioVersion = '8.5.7'             // Новое
       
       // Обновить существующие:
       set('jsonWebTokenVersion', '0.12.6')  // Было 0.12.5
       set('springDocVersion', '2.6.0')      // Уже есть, но не используется
   }
   ```

2. 🔧 Создать категоризированную систему зависимостей для удобства:
   ```groovy
   ext.deps = [
       database: [
           postgresql: "org.postgresql:postgresql:${postgresVersion}",
           liquibase: "org.liquibase:liquibase-core:${liquibaseVersion}",
           h2: "com.h2database:h2:${h2Version}"
       ],
       security: [
           jwtApi: "io.jsonwebtoken:jjwt-api:${jsonWebTokenVersion}",
           jwtImpl: "io.jsonwebtoken:jjwt-impl:${jsonWebTokenVersion}",
           jwtJackson: "io.jsonwebtoken:jjwt-jackson:${jsonWebTokenVersion}"
       ],
       rateLimit: [
           bucket4jCore: "com.bucket4j:bucket4j-core:${bucket4jVersion}",
           bucket4jRedis: "com.bucket4j:bucket4j-redis:${bucket4jVersion}"
       ],
       json: [
           hypersistenceUtils: "io.hypersistence:hypersistence-utils-hibernate-60:${hypersistenceVersion}",
           hibernateTypes: "com.vladmihalcea:hibernate-types-60:${hibernateTypesVersion}"
       ]
   ]
   ```

3. 🔄 Рефакторить все build.gradle файлы для использования централизованных версий:
   - Заменить хардкодные версии на переменные из root
   - Использовать deps структуру где возможно
4. 📋 Создать скрипт для проверки неиспользуемых версий в ext блоке

**Ожидаемый результат**: Все версии централизованы, упрощение обновлений, отсутствие unused переменных

### 6. Внедрение BOM-управления
**Задача**: Добавить управление через Bill of Materials для сторонних библиотек

**Шаги**:
1. 🔧 Добавить в dependencyManagement недостающие BOM:
   ```groovy
   dependencyManagement {
       imports {
           mavenBom "org.springframework.boot:spring-boot-dependencies:${springBootVersion}"
           mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
           mavenBom "org.testcontainers:testcontainers-bom:${testcontainersVersion}"
           mavenBom "com.fasterxml.jackson:jackson-bom:${jacksonVersion}"
       }
   }
   ```

2. 🔧 Удалить явные версии для зависимостей, управляемых BOM
3. 🧪 Проверить совместимость версий

**Ожидаемый результат**: Автоматическое управление совместимостью версий, уменьшение конфликтов

### 7. Оптимизация структуры плагинов
**Задача**: Стандартизировать применение плагинов

**Шаги**:
1. 🔧 Создать условное применение плагинов в root build.gradle:
   ```groovy
   subprojects {
       apply plugin: 'java-library'
       apply plugin: 'io.spring.dependency-management'
       
       if (project.name.endsWith('-api')) {
           apply plugin: 'org.springframework.boot'
       }
       
       if (project.name == 'backend-common') {
           apply plugin: 'maven-publish'
       }
   }
   ```

2. 🗑️ Удалить дублирующие применения плагинов из модулей
3. 📋 Документировать правила применения плагинов

**Ожидаемый результат**: Упрощение конфигурации модулей, единообразное применение плагинов

---

## 🟡 СРЕДНИЙ ПРИОРИТЕТ

### 8. Улучшение тестовой инфраструктуры
**Задача**: Стандартизировать конфигурацию тестов

**Шаги**:
1. 🔧 Добавить общую конфигурацию тестов в root build.gradle:
   ```groovy
   subprojects {
       test {
           useJUnitPlatform()
           testLogging {
               events "passed", "skipped", "failed"
               showStandardStreams = false
           }
           reports {
               html.required = true
               junitXml.required = true
           }
       }
   }
   ```

2. 🔧 Создать общие тестовые профили (unit, integration)
3. 📋 Стандартизировать использование Testcontainers

**Ожидаемый результат**: Единообразная конфигурация тестов, улучшенная отчетность

### 9. Добавление недостающих конфигураций
**Задача**: Внедрить отсутствующие best practices

**Шаги**:
1. 🔧 **Создать gradle.properties в корне** (файл отсутствует):
   ```properties
   # Build performance
   org.gradle.parallel=true
   org.gradle.caching=true
   org.gradle.daemon=true
   org.gradle.configuration-cache=true
   
   # JVM options
   org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC
   
   # Project properties
   version=1.0.0-SNAPSHOT
   group=org.aquastream
   
   # Reproducible builds
   org.gradle.configureondemand=false
   ```

2. 🔧 **Стандартизировать настройки компилятора** в root build.gradle:
   ```groovy
   subprojects {
       java {
           sourceCompatibility = JavaVersion.VERSION_21
           targetCompatibility = JavaVersion.VERSION_21
       }
       
       compileJava {
           options.compilerArgs += ['-parameters']
           options.encoding = 'UTF-8'
           options.deprecation = true
           options.warnings = true
       }
   }
   ```

3. 🔧 **Унифицировать OWASP dependency check** (сейчас неоднородно применяется):
   ```groovy
   subprojects {
       apply plugin: 'org.owasp.dependencycheck'
       
       dependencyCheck {
           format = 'ALL'
           suppressionFile = rootProject.file('owasp-suppression.xml')
       }
   }
   ```

4. 🔧 **Добавить недостающие repository конфигурации**:
   - Убедиться, что все модули используют единые репозитории
   - Добавить gradle plugin portal где нужно

**Ожидаемый результат**: Оптимизированная производительность сборки на 20-30%, улучшенная безопасность

### 10. Создание вспомогательных скриптов
**Задача**: Автоматизировать рутинные операции

**Шаги**:
1. 📄 Создать скрипт проверки актуальности зависимостей
2. 📄 Создать скрипт для анализа дублированных зависимостей
3. 📄 Создать скрипт для валидации структуры проекта

**Ожидаемый результат**: Автоматизация поддержки качества кода

---

### 11. Специфические задачи для backend-common
**Задача**: Оптимизировать центральную библиотеку проекта

**Проблемы**:
- Избыточное использование `api` вместо `implementation`
- Экспорт внутренних зависимостей наружу
- Отсутствие четкого API контракта

**Шаги**:
1. 🔧 **Пересмотреть api vs implementation зависимости**:
   ```groovy
   // Оставить как api только то, что должно быть доступно всем модулям:
   api 'org.springframework.boot:spring-boot-starter-validation'
   api 'org.springframework.boot:spring-boot-starter-web' // Если нужно везде
   
   // Перевести в implementation внутренние зависимости:
   implementation 'org.springframework.boot:spring-boot-starter-security'
   implementation 'org.springframework.boot:spring-boot-starter-data-redis'
   implementation 'com.fasterxml.jackson.core:jackson-databind'
   ```

2. 🔧 **Создать четкую документацию** для backend-common:
   - Что экспортируется через api
   - Какие классы и функции являются публичным API
   - Какие зависимости подтягиваются автоматически

3. 🔧 **Оптимизировать publishing конфигурацию**:
   - Добавить POM описание
   - Настроить правильные artifact classifiers

**Ожидаемый результат**: Четкий API backend-common, уменьшение транзитивных зависимостей

### 12. Специфические задачи для backend-gateway
**Задача**: Устранить дублирование с backend-common

**Проблемы**:
- Дублирует Security starter с backend-common
- Разные версии Bucket4j (core vs redis)
- Разные версии JWT библиотек

**Шаги**:
1. 🔧 **Удалить дублирующие зависимости**:
   ```groovy
   dependencies {
       implementation project(':backend-common')
       
       // Убрать дублирующие:
       // implementation 'org.springframework.boot:spring-boot-starter-security' // Уже в common
       
       // Специфичные для gateway:
       implementation 'org.springframework.boot:spring-boot-starter-webflux'
       implementation 'org.springframework.cloud:spring-cloud-starter-gateway'
   }
   ```

2. 🔧 **Унифицировать версии** с backend-common:
   - Использовать ту же версию Bucket4j
   - Убрать хардкодные версии JWT

**Ожидаемый результат**: Упрощенная конфигурация gateway, отсутствие конфликтов версий

## 🟢 НИЗКИЙ ПРИОРИТЕТ

### 13. Внедрение dependency locking
**Задача**: Обеспечить воспроизводимые сборки

**Шаги**:
1. 🔧 Добавить конфигурацию блокировки зависимостей в root build.gradle:
   ```groovy
   subprojects {
       dependencyLocking {
           lockAllConfigurations()
           lockMode = LockMode.STRICT
       }
   }
   ```
2. 🔧 Сгенерировать lock файлы: `./gradlew dependencies --write-locks`
3. 📋 Настроить автоматическое обновление lock файлов в CI/CD
4. 📋 Добавить lock файлы в git

**Ожидаемый результат**: Воспроизводимые сборки, стабильность CI/CD

### 14. Оптимизация производительности
**Задача**: Ускорить время сборки

**Шаги**:
1. 🔧 **Настроить build cache** (добавить в gradle.properties)
2. 🔧 **Оптимизировать параллельные сборки**:
   ```groovy
   // В gradle.properties
   org.gradle.parallel=true
   org.gradle.workers.max=4
   ```
3. 🔧 **Добавить task caching** для кастомных задач
4. 📊 **Профилирование времени сборки**: `./gradlew build --profile`
5. 🔧 **Оптимизировать test execution**:
   ```groovy
   test {
       maxParallelForks = Runtime.runtime.availableProcessors().intdiv(2) ?: 1
   }
   ```

**Ожидаемый результат**: Сокращение времени сборки на 30-50%

### 15. Создание документации
**Задача**: Документировать архитектуру build системы

**Шаги**:
1. 📋 **Создать BUILD.md** в корне проекта:
   - Архитектура модулей и их взаимосвязи
   - Принципы управления зависимостями
   - Команды для сборки и тестирования
2. 📋 **Обновить README для модулей**:
   - Назначение каждого модуля
   - Основные зависимости и их назначение
   - Специфичные конфигурации
3. 📋 **Создать руководство по добавлению новых модулей**:
   - Шаблоны build.gradle для api/service/db модулей
   - Чек-лист обязательных настроек
   - Примеры integration с backend-common
4. 📋 **Документировать dependency management**:
   - Карта всех используемых версий
   - Правила выбора api vs implementation
   - Процедуры обновления зависимостей

**Ожидаемый результат**: Упрощение onboarding новых разработчиков, стандартизация процессов

---

## Метрики успеха

### Количественные показатели
- ✅ **Устранение 100% конфликтов версий** (JWT: 0.12.5→0.12.6, Bucket4j: 8.7.0→8.10.1, Hypersistence: 3.5.1→3.6.0)
- ✅ **Сокращение дублирований на 80%** (PostgreSQL, Jackson, Lombok, Security starters)
- ✅ **Централизация 100% версий** в root build.gradle (добавить ~5 недостающих)
- ✅ **Оптимизация backend-common API** (api → implementation для 70% зависимостей)
- ✅ **Упрощение backend-gateway** (удаление 30% дублирующих зависимостей)
- 📊 **Сокращение времени сборки на 30%** (gradle.properties + caching)
- 📊 **Уменьшение размера конфигурации на 40%** (centralization + deduplication)

### Качественные улучшения
- 🎯 Единообразная структура всех модулей
- 🎯 Упрощение добавления новых модулей
- 🎯 Повышение стабильности CI/CD pipeline
- 🎯 Упрощение процесса обновления зависимостей

## Временные рамки

### Фаза 1 (Критические задачи) - 1-2 недели
- **Устранение критической совместимости Gradle 8.5 + Spring Boot 3.3.5** (НОВОЕ - может заблокировать сборку)
- Устранение конфликтов версий (JWT, Bucket4j, Hypersistence Utils)
- Удаление дубликатов зависимостей
- Стандартизация jar/bootJar конфигурации

### Фаза 2 (Высокий приоритет) - 2-3 недели  
- Централизация управления версиями (дополнение существующего ext блока)
- BOM-управление (Testcontainers, Jackson)
- Оптимизация структуры плагинов

### Фаза 3 (Средний приоритет) - 3-4 недели
- Улучшение тестовой инфраструктуры
- Добавление gradle.properties и недостающих конфигураций
- Создание вспомогательных скриптов
- **Оптимизация backend-common** (api vs implementation)
- **Упрощение backend-gateway** (устранение дублирования)

### Фаза 4 (Низкий приоритет) - 4-6 недель
- Внедрение dependency locking
- Оптимизация производительности сборки
- Создание полной документации по build системе

## Заключение

Данный план направлен на создание современной, стабильной и легко поддерживаемой системы сборки для проекта AquaStream. Реализация всех пунктов приведет к значительному повышению качества кода, скорости разработки и стабильности системы.

**Следующий шаг**: Начать с задач критического приоритета, двигаясь по плану пошагово с тщательным тестированием на каждом этапе.