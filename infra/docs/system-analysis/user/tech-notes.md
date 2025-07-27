# User Service – Tech Notes

## application.yml (excerpt)
```yaml
server:
  port: 8081
jwt:
  secret: <env JWT_SECRET>
  expiration-ms: 86400000
```

## Roles
`ROLE_USER`, `ROLE_ADMIN`

## Kafka Topic
`user-registration` – событие UserRegistered

## Endpoints security map
| Endpoint | Method | Role |
|----------|--------|------|
| /auth/register | POST | Public |
| /auth/login | POST | Public |
| /users/me | GET | USER |
| /users/{id} | GET | ADMIN | 