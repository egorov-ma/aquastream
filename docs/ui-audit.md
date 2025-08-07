# UI Audit

- Found `frontend/src/index.css`.

## Usage of color shades

### primary-600
- `frontend/src/components/layout/Footer/SocialLinks.tsx:52` — replace `hover:text-primary-600` with `hover:text-primary`.
- `frontend/src/components/layout/Footer/SocialLinks.tsx:60` — replace `group-hover:text-primary-600` with `group-hover:text-primary`.
- `frontend/src/components/layout/Footer/QuickLinks.tsx:47` — replace `hover:text-primary-600` with `hover:text-primary`.
- `frontend/src/components/ui/Card/Card.tsx:101` — replace `bg-primary-600` with `bg-primary`.
- `frontend/src/components/ui/Checkbox/Checkbox.tsx:91` — replace `bg-primary-600 border-primary-600` with `bg-primary border-primary`.
- `frontend/src/components/ui/Typography/Typography.tsx:83` — replace `text-primary-600` with `text-primary`.
- `frontend/src/components/ui/Typography/Typography.tsx:93` — replace `text-primary-600` with `text-primary` in mapping.
- `frontend/src/docs/examples/RegisterFormExample.tsx:231` — replace `text-primary-600` with `text-primary`.
- `frontend/src/pages/RegisterPage/index.tsx:196` — replace `bg-primary-600` with `bg-primary`.
- `frontend/src/pages/RegisterPage/index.tsx:207` — replace `text-primary-600` with `text-primary`.
- `frontend/src/components/ui/PageLoader/PageLoader.tsx:11` — replace `border-primary-600` with `border-primary`.
- `frontend/src/pages/LoginPage/index.tsx:114` — replace `bg-primary-600` with `bg-primary`.
- `frontend/src/pages/LoginPage/index.tsx:122` — replace `text-primary-600` with `text-primary`.
- `frontend/src/pages/LoginPage/index.tsx:128` — replace `text-primary-600` with `text-primary`.
- `frontend/src/routes/Routes.tsx:9` — replace `border-primary-600` with `border-primary`.

### gray-700
- `frontend/src/components/layout/Footer/SocialLinks.tsx:43` — replace `text-gray-700` with `text-muted-foreground`.
- `frontend/src/components/layout/Footer/SocialLinks.tsx:56` — replace `dark:bg-gray-700` with `dark:bg-muted`.
- `frontend/src/components/layout/Footer/SocialLinks.tsx:60` — replace `text-gray-700` with `text-muted-foreground`.
- `frontend/src/components/layout/Footer/Copyright.tsx:35` — replace `dark:border-gray-700` with `dark:border-border`.
- `frontend/src/docs/examples/CustomThemingExample.tsx:103` — replace `border-gray-700` with `border-border`.
- `frontend/src/components/ui/LazyImage/LazyImage.stories.tsx:59` — replace `dark:bg-gray-700` with `dark:bg-muted`.
- `frontend/src/pages/UIKitPage/UIKitPage.tsx:26` — replace `dark:border-gray-700` with `dark:border-border`.
- `frontend/src/components/EventCard/TimelineInfo.tsx:54` — replace `text-gray-700` with `text-muted-foreground`.
- `frontend/src/components/EventCard/FeaturesList.tsx:30` — replace `text-gray-700` with `text-muted-foreground`.

## Inline styles

No inline style attributes or `style` props found in `frontend/src`.
