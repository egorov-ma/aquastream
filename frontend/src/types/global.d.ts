/**
 * Глобальные объявления типов
 */

// Объявление модуля для CSS
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Объявление модуля для изображений
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

// Расширение Window для глобальных переменных
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof import('redux').compose;
}
