# Безопасность (as-is / to-be)

## As-is
- Spring Security + JWT (HS512)
- RBAC роли: Guest, User, Organizer, Admin
- Rate limiting через Bucket4j (gateway)

JWT payload (пример):
```json
{
  "sub": "user-uuid",
  "role": "ORGANIZER",
  "iat": 1704067200,
  "exp": 1704068100,
  "jti": "unique-token-id"
}
```

### Rate Limiting
```yaml
/api/v1/auth/*: 10 req/min per IP
/api/v1/payments/*: 30 req/min per user
/api/v1/*: 60 req/min per user
```

### Security Headers (prod)
```yaml
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

## To-be
- OAuth2 Authorization Code, cookie HttpOnly, SameSite=Lax
- CSP/HSTS/Referrer-Policy/X-Frame-Options в prod
