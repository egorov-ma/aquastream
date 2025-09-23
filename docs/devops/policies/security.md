# Security Policy

## Reporting a Vulnerability
- Используйте Private Vulnerability Reporting (вкладка Security → Report a vulnerability), если он включён в репозитории.
- Либо сообщите приватно мейнтейнерам одним из доступных каналов.

## Guidelines
- Не создавайте публичных issue об уязвимостях.
- Приложите минимальный воспроизводимый пример и затронутые версии.
- SLA: подтверждение в течение 3 рабочих дней; далее регулярные апдейты статуса.

## Scope
- Код `backend-*`, `frontend/`, инфраструктура `infra/`.
- CVE в сторонних зависимостях: приветствуются отчёты с контекстом влияния.

## Dependency Security Scanning

### OWASP Dependency-Check

Проект использует [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) для автоматического сканирования зависимостей на известные уязвимости.

**Конфигурация:**
- **Файл подавлений**: `owasp-suppression.xml` (корень репозитория)
- **Плагин**: применяется ко всем Java модулям через `JavaLibraryConventionsPlugin`
- **Отчеты**: генерируются в форматах SARIF и HTML

**Запуск сканирования:**
```bash
# Проверить все зависимости
./gradlew dependencyCheckAnalyze

# Просмотреть отчет
open build/reports/dependency-check-report.html
```

**Подавление ложных срабатываний:**

Если сканер выдает false positive, добавьте подавление в `owasp-suppression.xml`:

```xml
<suppress>
    <notes>Объяснение почему это ложное срабатывание</notes>
    <cve>CVE-YYYY-XXXXX</cve>
    <gav regex="true">^group:artifact:.*$</gav>
</suppress>
```

**Правила подавлений:**
- Всегда добавляйте подробный комментарий в `<notes>`
- Используйте точные GAV координаты, избегайте широких regex
- Периодически пересматривайте подавления при обновлении зависимостей
- Подавляйте только подтвержденные false positives

**API ключ NVD:**
Для ускорения сканирования установите переменную окружения `NVD_API_KEY` с ключом от [National Vulnerability Database](https://nvd.nist.gov/developers/request-an-api-key).

