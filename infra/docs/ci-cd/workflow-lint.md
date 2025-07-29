## Workflow Lint

Этот workflow проверяет все файлы в `.github/workflows` с помощью [actionlint](https://github.com/rhysd/actionlint).

```yaml
name: Lint Workflows
```

Запускается при изменениях в каталогe `.github/workflows/` и на основных ветках (`main`, `develop`).

Workflow использует минимальные права (`contents: read`) и директиву `concurrency` для исключения одновременных запусков.

