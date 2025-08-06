/**
 * Утилиты для безопасности приложения
 */

/**
 * Санитизирует HTML строку, удаляя потенциально опасные теги и атрибуты
 * @param html Строка HTML для обработки
 * @returns Санитизированная HTML строка
 */
export function sanitizeHtml(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html; // Автоматически экранирует HTML
  return tempDiv.innerHTML;
}

/**
 * Проверяет строку на соответствие регулярному выражению
 * @param input Строка для проверки
 * @param pattern Регулярное выражение
 * @returns true, если строка соответствует паттерну
 */
export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

/**
 * Экранирует спецсимволы регулярных выражений в строке
 * @param string Строка для экранирования
 * @returns Экранированная строка, безопасная для использования в регулярных выражениях
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Создает строку Content Security Policy (CSP) для защиты от XSS-атак
 * @returns Строка CSP для использования в заголовке Content-Security-Policy
 */
export function createCSP(): string {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://storage.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.aquastream.ru;
  `
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Проверяет строку на наличие скриптов XSS
 * @param input Строка для проверки
 * @returns true, если строка может содержать XSS
 */
export function containsXSS(input: string): boolean {
  // Простая проверка на наличие тегов script, обработчиков событий и iframe
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
    /on\w+\s*=\s*["']?[^"']*["']?/i,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i,
    /javascript\s*:/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Генерирует nonce для CSP
 * @returns Случайная строка, которую можно использовать как nonce в CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Проверяет и санитизирует URL
 * @param url URL для проверки
 * @param allowedDomains Массив разрешенных доменов, если не указан - разрешены все домены
 * @returns Санитизированный URL или null, если URL не прошел проверку
 */
export function sanitizeUrl(url: string, allowedDomains?: string[]): string | null {
  try {
    // Проверяем, что URL валидный
    const parsedUrl = new URL(url);

    // Проверяем, что протокол http или https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    // Проверяем домен, если указан список разрешенных
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) => {
        // Проверяем точное совпадение или субдомен
        return parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`);
      });

      if (!isAllowed) {
        return null;
      }
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}
