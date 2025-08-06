# Elasticsearch Security Configuration

## Обзор безопасности

Elasticsearch теперь настроен с включенной безопасностью xpack.security и TLS шифрованием для всех соединений.

## Учетные данные
> Секреты рекомендуется хранить в GitHub Secrets и передавать их в окружение при запуске `run.sh --use-env`.

### Elasticsearch
- **Пользователь**: `elastic`
- **Пароль**: `<ELASTIC_PASSWORD>` (настраивается в `.env` как `ELASTIC_PASSWORD` или через переменную окружения при запуске `./run.sh --use-env`)
- **URL**: ~~`https://localhost:9200`~~ → **Доступ через Nginx Reverse Proxy**

### Kibana
- **Пользователь**: `kibana_system`
- **Пароль**: `<KIBANA_PASSWORD>` (настраивается в `.env` как `KIBANA_PASSWORD` или через переменную окружения при запуске `./run.sh --use-env`)
- **URL**: ~~`https://localhost:5601`~~ → **Доступ через Nginx**: `https://localhost/monitoring/kibana/`
- **Basic Auth**: admin:monitoring123 (для доступа через Nginx)

## SSL Сертификаты

Система автоматически создает самоподписанные SSL сертификаты:
- **CA**: `/var/lib/docker/volumes/aquastream_elasticsearch_certs/_data/ca/ca.crt`
- **Elasticsearch**: `/var/lib/docker/volumes/aquastream_elasticsearch_certs/_data/elasticsearch/`
- **Kibana**: `/var/lib/docker/volumes/aquastream_elasticsearch_certs/_data/kibana/`

## Подключение к Elasticsearch

### Curl команды
```bash
# Проверка здоровья кластера
curl -k -u elastic:<ELASTIC_PASSWORD> https://localhost:9200/_cluster/health

# Получение информации о кластере
curl -k -u elastic:<ELASTIC_PASSWORD> https://localhost:9200/

# Просмотр индексов
curl -k -u elastic:<ELASTIC_PASSWORD> https://localhost:9200/_cat/indices?v
```

### С использованием CA сертификата
```bash
# Получить CA сертификат из контейнера
docker cp aquastream-elasticsearch-setup-1:/usr/share/elasticsearch/config/certs/ca/ca.crt ./ca.crt

# Использовать CA сертификат
curl --cacert ca.crt -u elastic:<ELASTIC_PASSWORD> https://localhost:9200/_cluster/health
```

## Конфигурация компонентов

### Elasticsearch
- xpack.security включен
- HTTP и Transport SSL включены
- Самоподписанные сертификаты
- Basic лицензия

### Kibana  
- Подключение через HTTPS
- SSL сертификаты для веб-интерфейса
- Аутентификация через kibana_system пользователя

### Logstash
- SSL подключение к Elasticsearch
- Проверка сертификатов включена
- Аутентификация через elastic пользователя

## Устранение неполадок

### Проверка статуса сервисов
```bash
docker compose ps
docker compose logs elasticsearch
docker compose logs kibana
docker compose logs logstash
```

### Общие проблемы

1. **Elasticsearch не запускается**
   - Проверьте, что сертификаты созданы: `docker compose logs elasticsearch-setup`
   - Убедитесь в правильности паролей в `.env` или переменных окружения

2. **Kibana не подключается**
   - Проверьте, что пользователь kibana_system настроен: `docker compose logs elasticsearch-init`
   - Убедитесь, что Elasticsearch здоров

3. **Logstash не может отправить логи**
   - Проверьте SSL сертификаты в logstash
   - Убедитесь в правильности credentials

## Рекомендации по безопасности

1. **Смените пароли по умолчанию** в production среде
2. **Используйте внешний CA** для production сертификатов
3. **Ограничьте сетевой доступ** к портам Elasticsearch
4. **Настройте ротацию логов** для ограничения дискового пространства
5. **Регулярно обновляйте** версии Elastic Stack

## Мониторинг безопасности

Настройте алерты в Kibana для:
- Неудачных попыток аутентификации
- Необычного трафика
- Ошибок SSL сертификатов
- Превышения лимитов ресурсов