# User API

Статус: as-is

## Аутентификация
```yaml
POST /api/v1/auth/register   # {username,password} -> {userId, token, refreshToken}
POST /api/v1/auth/login      # {username,password} -> {userId, token, refreshToken, role}
POST /api/v1/auth/refresh    # {refreshToken} -> {token, refreshToken}
POST /api/v1/auth/recovery/init  # {telegram} -> {success}
```

## Профиль
```yaml
GET  /api/v1/profile/me          # -> {userId, username, role, profile}
PUT  /api/v1/profile             # {phone?, telegram?} -> {profile}
POST /api/v1/profile/telegram/link  # -> {verificationUrl}
```

Документация API (ReDoc): ../../api/redoc/root/backend-user-api.html
