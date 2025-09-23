# Глобальная аутентификация

## Цель
Единый подход к аутентификации (и базовой авторизации) для всех сервисов.

## Компоненты
- Gateway (JWT в заголовках, CORS, защита публичных маршрутов)
- User Service (выдача/проверка токенов, refresh, роли)

## Потоки
1. Логин: FE → Gateway → User → JWT → FE
2. Проверка: FE/GW → сервисы (проброс заголовка Authorization)

## Спецификации и детали
- Gateway: см. backend/gateway/api.md и modules/backend-gateway/README.md
- User: см. backend/user/api.md и modules/backend-user/backend-user-service/README.md

## Чек‑лист
- [ ] JWT подписывается надёжным ключом; выполняется ротация ключей
- [ ] Время жизни access/refresh определено; есть revoke
- [ ] CORS/headers в Gateway настроены корректно
- [ ] Public/Protected маршруты перечислены явно
- [ ] Роли/права описаны в user-roles (business)

