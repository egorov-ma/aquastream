## Frontend CI

Workflow запускается при изменениях в каталоге `frontend/`.

```yaml
name: Frontend CI
```

Этап `build-test` выполняет:
- установку Node.js и кэширование `npm`;
- линтинг (`npm run lint`);
- проверку типов (`tsc --noEmit`);
- запуск тестов с отчётом покрытия (`npm run test:ci`);
- генерацию бейджей и продакшн-сборку (`npm run build`).

Артефакты: `coverage-report`, `frontend-build`.

Как и для backend, workflow использует минимальные разрешения
(`contents: read`, `actions: write`) и директиву `concurrency` для отмены
повторяющихся запусков.
