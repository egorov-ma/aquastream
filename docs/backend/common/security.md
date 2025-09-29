# Безопасность (as-is / to-be)

## As-is
- Spring Security + JWT (HS512)
- RBAC роли: Guest, User, Organizer, Admin
- Rate limiting через Bucket4j (gateway)

## To-be
- OAuth2 Authorization Code, cookie HttpOnly, SameSite=Lax
- CSP/HSTS/Referrer-Policy/X-Frame-Options в prod
