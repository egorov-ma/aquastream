# Безопасность (Frontend)

Статус: as-is/to-be

## Аутентификация и сессии
- As-is: JWT в cookie (HttpOnly) от бэкенда
- To-be: OAuth2 Authorization Code → HttpOnly Secure cookie (`sid`, роль), SameSite=Lax
- RBAC (middleware), 403 при отсутствии прав

## CSRF
- Для небезопасных методов — `X-CSRF-Token` вне OAuth2 редиректов

## Заголовки безопасности (prod)
- CSP, HSTS, Referrer-Policy, X-Frame-Options — через `next.config.ts`
