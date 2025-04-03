/**
 * Базовые свойства карточки события
 */
export interface EventBasicProps {
  /**
   * Уникальный идентификатор события
   */
  id: string;
  /**
   * Название события
   */
  title: string;
  /**
   * Путь для подробной информации
   */
  path?: string;
  /**
   * Текст кнопки
   */
  buttonText?: string;
  /**
   * Обработчик клика по карточке
   */
  onClick?: () => void;
  /**
   * Дополнительные CSS-классы
   */
  className?: string;
}

/**
 * Свойства даты и времени события
 */
export interface EventDateProps {
  /**
   * Дата начала события
   */
  startDate: string;
  /**
   * Время начала события
   */
  startTime: string;
  /**
   * Дата окончания события
   */
  endDate: string;
  /**
   * Время окончания события
   */
  endTime: string;
}

/**
 * Свойства участников события
 */
export interface EventParticipantsProps {
  /**
   * Зарегистрированные участники
   */
  registeredParticipants: number;
  /**
   * Максимальное количество участников
   */
  maxParticipants: number;
}

/**
 * Свойства особенностей события
 */
export interface EventFeaturesProps {
  /**
   * Сложность события от 1 до 5
   */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /**
   * Особенности события/активности
   */
  features: string[];
  /**
   * Место проведения
   */
  location?: string;
}

/**
 * Полные свойства карточки события
 */
export type EventCardProps = EventBasicProps & 
  EventDateProps & 
  EventParticipantsProps & 
  EventFeaturesProps; 