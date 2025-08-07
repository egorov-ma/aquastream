/* eslint-disable max-lines, react/no-unescaped-entities */
import React, { useState } from 'react';

import { 
  Button, 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  TextField,
  LazyImage,
  Modal,
  Typography
} from '../../components/ui';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="mb-12">
      <Typography variant="h2" className="mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </Typography>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

const ButtonSection = () => {
  return (
    <Section title="Кнопки">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Typography variant="subtitle-1">Primary</Typography>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm">Маленькая</Button>
            <Button variant="default">Средняя</Button>
            <Button variant="default" size="lg">Большая</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-1">Secondary</Typography>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">Маленькая</Button>
            <Button variant="secondary">Средняя</Button>
            <Button variant="secondary" size="lg">Большая</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-1">Outline</Typography>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">Маленькая</Button>
            <Button variant="outline">Средняя</Button>
            <Button variant="outline" size="lg">Большая</Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="space-y-2">
          <Typography variant="subtitle-1">Danger</Typography>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive">Опасное действие</Button>
            <Button variant="destructive" disabled>Недоступно</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-1">Loading</Typography>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" loading>Загрузка...</Button>
            <Button variant="secondary" loading>Загрузка...</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-1">Full Width</Typography>
          <Button variant="default" fullWidth>Во всю ширину</Button>
        </div>
      </div>
    </Section>
  );
};

const TypographySection = () => {
  return (
    <Section title="Типографика">
      <div className="space-y-4">
        <Typography variant="h1">H1 - Заголовок первого уровня</Typography>
        <Typography variant="h2">H2 - Заголовок второго уровня</Typography>
        <Typography variant="h3">H3 - Заголовок третьего уровня</Typography>
        <Typography variant="h4">H4 - Заголовок четвертого уровня</Typography>
        <Typography variant="h5">H5 - Заголовок пятого уровня</Typography>
        <Typography variant="h6">H6 - Заголовок шестого уровня</Typography>
        <Typography variant="subtitle-1">Subtitle 1 - Подзаголовок первого уровня</Typography>
        <Typography variant="subtitle-2">Subtitle 2 - Подзаголовок второго уровня</Typography>
        <Typography variant="body-1">Body 1 - Основной текст первого уровня. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</Typography>
        <Typography variant="body-2">Body 2 - Основной текст второго уровня. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.</Typography>
        <Typography variant="caption">Caption - Мелкий текст для подписей</Typography>
        <Typography variant="overline">OVERLINE - ТЕКСТ СВЕРХУ</Typography>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="space-y-2">
          <Typography variant="subtitle-2">Цвета текста</Typography>
          <Typography color="primary">Текст основного цвета</Typography>
          <Typography color="secondary">Текст дополнительного цвета</Typography>
          <Typography color="error">Текст цвета ошибки</Typography>
          <Typography color="success">Текст цвета успеха</Typography>
          <Typography color="warning">Текст цвета предупреждения</Typography>
          <Typography color="info">Текст информационного цвета</Typography>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-2">Выравнивание</Typography>
          <Typography align="left">Выравнивание слева</Typography>
          <Typography align="center">Выравнивание по центру</Typography>
          <Typography align="right">Выравнивание справа</Typography>
        </div>
        
        <div className="space-y-2">
          <Typography variant="subtitle-2">Специальные стили</Typography>
          <Typography className="mb-4">Текст с нижним отступом</Typography>
          <Typography className="whitespace-nowrap overflow-hidden text-ellipsis">Очень длинный текст без переноса строк, который будет обрезан троеточием в конце</Typography>
          <Typography className="italic">Наклонный текст</Typography>
          <Typography className="font-bold">Жирный текст</Typography>
        </div>
      </div>
    </Section>
  );
};

const CardSection = () => {
  return (
    <Section title="Карточки">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          variant="default" 
          hoverEffect="lift"
          appearEffect="fade-in"
        >
          <CardHeader>
            <CardTitle>Стандартная карточка</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Это стандартная карточка с эффектом подъема при наведении.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="default" size="sm">Действие</Button>
          </CardFooter>
        </Card>
        
        <Card 
          variant="outlined" 
          hoverEffect="glow"
          appearEffect="slide-up"
        >
          <CardHeader>
            <CardTitle>Карточка с обводкой</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Карточка с обводкой и эффектом свечения при наведении.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Действие</Button>
          </CardFooter>
        </Card>
        
        <Card 
          variant="elevated" 
          hoverEffect="scale"
          appearEffect="zoom-in"
        >
          <CardHeader>
            <CardTitle>Карточка с тенью</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Карточка с тенью и эффектом масштабирования при наведении.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm">Действие</Button>
          </CardFooter>
        </Card>
        
        <Card 
          variant="primary"
          hoverEffect="glow-accent"
          appearEffect="blur-in" 
        >
          <CardHeader>
            <CardTitle>Карточка основного цвета</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Карточка основного цвета с акцентным свечением при наведении.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm">Действие</Button>
          </CardFooter>
        </Card>
        
        <Card 
          variant="accent" 
          hoverEffect="card-hover"
          appearEffect="fade-up"
        >
          <CardHeader>
            <CardTitle>Акцентная карточка</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Акцентная карточка с комплексной анимацией при наведении.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="default" size="sm">Действие</Button>
          </CardFooter>
        </Card>
        
        <Card 
          variant="flat"
          onClick={() => alert('Карточка с действием при клике')}
          hoverEffect="lift"
          appearEffect="scale"
        >
          <CardHeader>
            <CardTitle>Интерактивная карточка</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body-2">
              Карточка с плоским фоном и действием при клике.
            </Typography>
          </CardContent>
          <CardFooter>
            <Typography variant="caption">Нажмите для действия</Typography>
          </CardFooter>
        </Card>
      </div>
    </Section>
  );
};

const InputSection = () => {
  const [value, setValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  
  return (
    <Section title="Поля ввода">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TextField
            label="Стандартное поле ввода"
            placeholder="Введите текст"
            helperText="Вспомогательный текст для поля ввода"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            clearable
            onClear={() => setValue('')}
          />

          <TextField
            label="Поле с ошибкой"
            error="Это сообщение об ошибке"
            placeholder="Неправильные данные"
          />

          <TextField
            label="Отключенное поле"
            placeholder="Недоступно для редактирования"
            disabled
          />
        </div>

        <div className="space-y-4">
          <TextField
            label="Поле с иконкой слева"
            placeholder="Поиск..."
            leftIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            clearable
          />

          <TextField
            label="Поле для пароля"
            type="password"
            placeholder="Введите пароль"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            rightIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
            clearable
            onClear={() => setPasswordValue('')}
          />

          <TextField
            label="Маленькое поле"
            placeholder="Маленький размер"
            size="sm"
          />
        </div>
      </div>
    </Section>
  );
};

const CheckboxSection = () => {
  const [checked, setChecked] = useState(false);
  
  return (
    <Section title="Чекбоксы">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Checkbox
            label="Стандартный чекбокс"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          
          <Checkbox
            label="Чекбокс с большим размером"
            size="large"
          />
          
          <Checkbox
            label="Чекбокс с маленьким размером"
            size="small"
          />
        </div>
        
        <div className="space-y-4">
          <Checkbox
            label="Отключенный чекбокс"
            disabled
          />
          
          <Checkbox
            label="Отключенный отмеченный чекбокс"
            checked
            disabled
          />
          
          <Checkbox
            label="Чекбокс с ошибкой"
            error
          />
        </div>
      </div>
    </Section>
  );
};

const ModalSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Section title="Модальные окна">
      <div className="space-y-4">
        <Button 
          variant="default" 
          onClick={() => setIsOpen(true)}
        >
          Открыть модальное окно
        </Button>
        
        <Modal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Демонстрационное модальное окно"
        >
          <div className="space-y-4">
            <Typography variant="body-1">
              Это демонстрационное модальное окно с заголовком, содержимым и кнопками действий.
            </Typography>
            
            <Typography variant="body-2">
              Вы можете закрыть его, нажав на кнопку "Закрыть", кнопку "X" или кликнув за пределами модального окна.
            </Typography>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Подтвердить
            </Button>
          </div>
        </Modal>
      </div>
    </Section>
  );
};

const LazyImageSection = () => {
  return (
    <Section title="Ленивые изображения">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Typography variant="subtitle-2" className="mb-2">Стандартное изображение</Typography>
          <LazyImage
            src="https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="Горы и река"
            className="w-full h-[200px]"
            rounded="md"
            shadow="md"
            fadeAnimation="fade"
          />
        </div>
        
        <div>
          <Typography variant="subtitle-2" className="mb-2">С эффектом размытия</Typography>
          <LazyImage
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="Звездное небо"
            className="w-full h-[200px]"
            rounded="lg"
            shadow="lg"
            fadeAnimation="blur"
            hoverEffect="zoom"
          />
        </div>
        
        <div>
          <Typography variant="subtitle-2" className="mb-2">С масштабированием</Typography>
          <LazyImage
            src="https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
            alt="Горный пейзаж"
            className="w-full h-[200px]"
            rounded="xl"
            shadow="sm"
            fadeAnimation="zoom"
            hoverEffect="brightness"
          />
        </div>
      </div>
    </Section>
  );
};

export const UIKitPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h1" className="mb-8 text-center">
        UI Kit
      </Typography>
      
      <Typography variant="body-1" className="mb-12 text-center max-w-3xl mx-auto">
        Эта страница демонстрирует все доступные UI-компоненты проекта AquaStream с различными вариантами и конфигурациями.
      </Typography>
      
      <div className="space-y-16">
        <TypographySection />
        <ButtonSection />
        <CardSection />
        <InputSection />
        <CheckboxSection />
        <LazyImageSection />
        <ModalSection />
      </div>
    </div>
  );
};

export default UIKitPage; 