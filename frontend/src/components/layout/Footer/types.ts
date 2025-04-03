import React from 'react';

/**
 * Интерфейс для навигационной ссылки в футере
 */
export interface NavLink {
  /** Название ссылки */
  name: string;
  /** Путь для перехода */
  path: string;
  /** Ключ для локализации (необязательный) */
  labelKey?: string;
}

/**
 * Интерфейс для социальной ссылки
 */
export interface SocialLink {
  /** Название соцсети */
  name: string;
  /** Иконка соцсети */
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  /** URL соцсети */
  url: string;
  /** Описание ссылки */
  description?: string;
}

/**
 * Интерфейс для контактной информации
 */
export interface ContactInfo {
  /** Email */
  email?: string;
  /** Телефон */
  phone?: string;
  /** Адрес */
  address?: string;
}

/**
 * Базовые свойства компонента Footer
 */
export interface FooterBaseProps {
  /** Дополнительные CSS-классы */
  className?: string;
}

/**
 * Свойства контента для компонента Footer
 */
export interface FooterContentProps {
  /** Название организации */
  companyName?: string;
  /** Описание */
  description?: string;
  /** Навигационные ссылки */
  navLinks?: NavLink[];
  /** Социальные ссылки */
  socialLinks?: SocialLink[];
  /** Контактная информация */
  contactInfo?: ContactInfo;
  /** Текст копирайта */
  copyrightText?: string;
}

/**
 * Полные свойства компонента Footer
 */
export type FooterProps = FooterBaseProps & FooterContentProps; 