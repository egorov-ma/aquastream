import { useState, useEffect } from 'react';

import { Button, Modal, TextField, Typography } from '../../components/ui';

/**
 * Пример демонстрирует, как можно использовать Tailwind для создания
 * кастомной темы компонентов UI библиотеки AquaStream
 */
const CustomThemingExample = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [customColor, setCustomColor] = useState('#6366f1'); // Indigo-500 по умолчанию

  // Класс для темной темы
  const darkModeClass = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  // Обновляем CSS переменную при изменении цвета
  useEffect(() => {
    document.documentElement.style.setProperty('--custom-color', customColor);
  }, [customColor]);

  // Класс для кнопок
  const customButtonClass = 'custom-button-color hover:bg-opacity-90 text-white';

  return (
    <div className={`p-8 rounded-lg shadow-lg transition-colors duration-300 ${darkModeClass}`}>
      <Typography
        variant="h4"
        align="center"
        className="mb-6"
        color={darkMode ? 'primary' : 'secondary'}
      >
        Настройка темы компонентов
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <Typography variant="h6">Настройки темы</Typography>

          <div className="flex items-center space-x-2">
            <Button
              variant={darkMode ? 'default' : 'outline'}
              onClick={() => setDarkMode(true)}
              className="flex-1"
            >
              Темная тема
            </Button>
            <Button
              variant={!darkMode ? 'default' : 'outline'}
              onClick={() => setDarkMode(false)}
              className="flex-1"
            >
              Светлая тема
            </Button>
          </div>

          <div className="mt-4">
            <label htmlFor="colorPicker" className="block mb-2">
              <Typography variant="body-1">Выберите основной цвет:</Typography>
            </label>
            <input
              id="colorPicker"
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Typography variant="h6">Предварительный просмотр</Typography>

          <TextField
            label="Текстовое поле"
            placeholder="Введите текст"
            fullWidth
            className={darkMode ? 'dark-input' : ''}
          />

          <Button
            variant="default"
            className={customButtonClass}
            onClick={() => setModalOpen(true)}
          >
            Открыть модальное окно
          </Button>

          <div className="flex space-x-2 mt-4">
            <Button variant="default" size="sm" className={customButtonClass}>
              Маленькая кнопка
            </Button>
            <Button variant="default" className={customButtonClass}>
              Средняя
            </Button>
            <Button variant="default" size="lg" className={customButtonClass}>
              Большая кнопка
            </Button>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <Typography variant="body-1" className="mb-2">
          Код для кастомизации темы:
        </Typography>
        <pre className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} overflow-auto`}>
          <code>
            {`// Пример применения кастомной темы
const darkModeClass = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

// Устанавливаем CSS переменную для цвета
useEffect(() => {
  document.documentElement.style.setProperty('--custom-color', customColor);
}, [customColor]);

const customButtonClass = 'custom-button-color hover:bg-opacity-90 text-white';

// Использование в компонентах
<div className={\`p-8 \${darkModeClass}\`}>
  <Button variant="default" className={customButtonClass}>
    Кастомная кнопка
  </Button>
</div>`}
          </code>
        </pre>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Кастомное модальное окно"
        className={darkMode ? 'dark-modal' : ''}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className={darkMode ? 'text-white border-white' : ''}
            >
              Отмена
            </Button>
            <Button
              variant="default"
              onClick={() => setModalOpen(false)}
              className={customButtonClass}
            >
              Ок
            </Button>
          </>
        }
      >
        <Typography variant="body-1">
          Это модальное окно с кастомной темой, основанной на выбранных настройках.
        </Typography>
      </Modal>
    </div>
  );
};

// Добавляем глобальные стили в отдельный компонент
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  :root {
    --custom-color: #6366f1;
  }
  .custom-button-color {
    background-color: var(--custom-color);
  }
  .custom-button-color:focus {
    --tw-ring-color: var(--custom-color);
  }
`;
document.head.appendChild(styleTag);

export default CustomThemingExample;
