/**
 * Утилиты для работы с датами
 */

/**
 * Форматирует дату для отображения в российском формате
 * @param dateString строка даты ISO
 * @returns отформатированная дата
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Проверка валидности даты
  if (isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Форматирует дату и время для отображения в российском формате
 * @param dateString строка даты ISO
 * @returns отформатированная дата и время
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Проверка валидности даты
  if (isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Возвращает относительную дату (вчера, сегодня, завтра, или отформатированную дату)
 * @param dateString строка даты ISO
 * @returns относительная или отформатированная дата
 */
export const getRelativeDate = (dateString: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Проверка валидности даты
  if (isNaN(date.getTime())) {
    return '';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    return 'Сегодня';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Вчера';
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Завтра';
  } else {
    return formatDate(dateString);
  }
};

/**
 * Форматирует продолжительность события с датой начала и окончания
 * @param startDate дата начала (ISO строка)
 * @param endDate дата окончания (ISO строка)
 * @returns отформатированный диапазон дат
 */
export const formatDateRange = (startDate: string, endDate?: string): string => {
  if (!startDate) return '';

  if (!endDate) {
    return formatDate(startDate);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Проверка валидности дат
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return formatDate(startDate);
  }

  const isSameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (isSameDay) {
    const formattedDate = formatDate(startDate);
    const startTime = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return `${formattedDate}, ${startTime} - ${endTime}`;
  } else {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
};

/**
 * Проверяет, является ли дата будущей
 * @param dateString - строка с датой в формате ISO
 * @returns true, если дата в будущем, иначе false
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * Возвращает разницу между двумя датами в днях
 * @param dateString1 - первая дата в формате ISO
 * @param dateString2 - вторая дата в формате ISO (по умолчанию текущая дата)
 * @returns количество дней между датами
 */
export const getDaysDifference = (
  dateString1: string,
  dateString2: string = new Date().toISOString()
): number => {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Возвращает относительное время (например, "через 2 дня" или "3 дня назад")
 * @param dateString - строка с датой в формате ISO
 * @returns строка с относительным временем
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    if (diffDays === 1) return 'Завтра';
    if (diffDays < 7) return `Через ${diffDays} ${getDayWord(diffDays)}`;
    if (diffDays < 30)
      return `Через ${Math.floor(diffDays / 7)} ${getWeekWord(Math.floor(diffDays / 7))}`;
    return formatDate(dateString);
  } else if (diffDays < 0) {
    const absDiffDays = Math.abs(diffDays);
    if (absDiffDays === 1) return 'Вчера';
    if (absDiffDays < 7) return `${absDiffDays} ${getDayWord(absDiffDays)} назад`;
    if (absDiffDays < 30)
      return `${Math.floor(absDiffDays / 7)} ${getWeekWord(Math.floor(absDiffDays / 7))} назад`;
    return formatDate(dateString);
  } else {
    return 'Сегодня';
  }
};

/**
 * Вспомогательная функция для склонения слова "день"
 * @param count - количество дней
 * @returns правильная форма слова "день"
 */
const getDayWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'день';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'дня';
  } else {
    return 'дней';
  }
};

/**
 * Вспомогательная функция для склонения слова "неделя"
 * @param count - количество недель
 * @returns правильная форма слова "неделя"
 */
const getWeekWord = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'неделю';
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return 'недели';
  } else {
    return 'недель';
  }
};
