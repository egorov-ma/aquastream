import { Button, ButtonGroup, Tooltip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Компонент для переключения языков приложения
 */
export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];
  
  const handleLanguageChange = (langCode: string) => {
    void i18n.changeLanguage(langCode);
  };
  
  return (
    <ButtonGroup size="small" aria-label="language switcher">
      {languages.map((lang) => (
        <Tooltip key={lang.code} title={lang.label}>
          <Button
            onClick={() => handleLanguageChange(lang.code)}
            variant={i18n.language === lang.code ? 'contained' : 'outlined'}
            sx={{ 
              minWidth: '40px',
              fontWeight: i18n.language === lang.code ? 'bold' : 'normal'
            }}
          >
            {lang.code.toUpperCase()}
          </Button>
        </Tooltip>
      ))}
    </ButtonGroup>
  );
}; 