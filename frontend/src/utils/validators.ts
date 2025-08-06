/**
 * Модуль для валидации полей форм
 */

/**
 * Проверяет, что email имеет правильный формат
 * @param email Адрес электронной почты
 * @returns true, если email валидный, false в противном случае
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Проверяет, что пароль соответствует требованиям безопасности
 * @param password Пароль
 * @returns true, если пароль валидный, false в противном случае
 */
export const isValidPassword = (password: string): boolean => {
  // Минимум 8 символов, содержит цифру и букву
  return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
};

/**
 * Проверяет, что строка не пустая
 * @param value Строка для проверки
 * @returns true, если строка не пустая, false в противном случае
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Проверяет, что номер телефона имеет правильный формат
 * @param phone Номер телефона
 * @returns true, если номер телефона валидный, false в противном случае
 */
export const isValidPhone = (phone: string): boolean => {
  // Более гибкая проверка для российских номеров
  const simplePhoneRegex =
    /^(\+7|7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
  return simplePhoneRegex.test(phone);
};

/**
 * Проверяет, что URL имеет правильный формат
 * @param url URL для проверки
 * @returns true, если URL валидный, false в противном случае
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Проверяет, что строка содержит только буквы
 * @param value Строка для проверки
 * @returns true, если строка содержит только буквы, false в противном случае
 */
export const isAlpha = (value: string): boolean => {
  return /^[a-zA-Zа-яА-Я\s]*$/.test(value);
};

/**
 * Проверяет, что строка содержит только цифры
 * @param value Строка для проверки
 * @returns true, если строка содержит только цифры, false в противном случае
 */
export const isNumeric = (value: string): boolean => {
  return /^[0-9]*$/.test(value);
};

/**
 * Проверяет, что строка содержит допустимое число
 * @param value Строка для проверки
 * @returns true, если строка содержит допустимое число, false в противном случае
 */
export const isValidNumber = (value: string): boolean => {
  if (value === '') return false;
  return !isNaN(Number(value));
};

/**
 * Проверяет, что значение находится в указанном диапазоне
 * @param value Значение для проверки
 * @param min Минимальное значение
 * @param max Максимальное значение
 * @returns true, если значение в диапазоне, false в противном случае
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Проверяет, что дата не в прошлом
 * @param dateString Строка с датой
 * @returns true, если дата не в прошлом, false в противном случае
 */
export const isNotPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};
