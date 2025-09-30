# Setup (Frontend)

Статус: as-is

## Требования
- Node.js 22 LTS
- pnpm

## Установка
```bash
pnpm install
```

## Скрипты
```bash
pnpm dev
pnpm build
pnpm test
```

## Моки (dev)
```bash
NEXT_PUBLIC_USE_MOCKS=true NEXT_PUBLIC_API_BASE_URL=http://localhost:3101 PORT=3101 pnpm dev
```

## ENV (MVP)
- NEXT_PUBLIC_APP_ENV=dev|prod
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_USE_MOCKS=true|false
- PAYMENTS_PROVIDER=yookassa|cloudpayments|stripe
- NEXT_PUBLIC_TELEGRAM_BOT_NAME
