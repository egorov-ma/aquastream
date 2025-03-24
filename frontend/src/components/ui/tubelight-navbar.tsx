import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon | React.FC;
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
}

interface TubelightNavBarProps {
  items: NavItem[];
  className?: string;
  defaultActive?: string;
  /** Отображение в виде подвала (мобильная навигация внизу экрана) */
  asFooter?: boolean;
  /** Темный режим */
  darkMode?: boolean;
  /** Прозрачный фон */
  transparent?: boolean;
  /** Выравнивание */
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Эффект появления */
  appearEffect?: 'none' | 'fade-in' | 'slide-up' | 'slide-down';
}

// Типы для reducer
interface NavState {
  activeTab: string;
  isMobile: boolean;
  isScrolled: boolean;
}

type NavAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_MOBILE_STATE'; payload: boolean }
  | { type: 'SET_SCROLLED_STATE'; payload: boolean };

// Reducer для управления состоянием навигации
const navReducer = (state: NavState, action: NavAction): NavState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'SET_MOBILE_STATE':
      return {
        ...state,
        isMobile: action.payload,
      };
    case 'SET_SCROLLED_STATE':
      return {
        ...state,
        isScrolled: action.payload,
      };
    default:
      return state;
  }
};

const initialState: NavState = {
  activeTab: '',
  isMobile: false,
  isScrolled: false,
};

// Анимации для framer-motion
const tabVariants = {
  active: {
    width: 'calc(100% - 16px)',
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 19,
    },
  },
  inactive: {
    width: 0,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 19,
    },
  },
};

// Анимации для мобильной версии
const mobileTabVariants = {
  active: {
    height: 3,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 19,
    },
  },
  inactive: {
    height: 0,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 19,
    },
  },
};

// Анимации для бейджей
const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

// Анимации для контейнера
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.3,
    },
  },
  slideUp: {
    opacity: 0,
    y: 20,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.2,
    },
  },
};

// Анимации для элементов
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

export function TubelightNavBar({
  items,
  className = '',
  defaultActive = 'Главная',
  asFooter = false,
  darkMode = false,
  transparent = false,
  alignment = 'center',
  appearEffect = 'none',
}: TubelightNavBarProps) {
  const location = useLocation();
  const [state, dispatch] = useReducer(navReducer, {
    ...initialState,
    activeTab: defaultActive,
  });

  // Обновление активного таба при изменении маршрута
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = items.find((item) => item.url === currentPath);
    if (activeItem) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: activeItem.name });
    }
  }, [location.pathname, items]);

  // Определение мобильного вида
  useEffect(() => {
    const checkIfMobile = () => {
      dispatch({
        type: 'SET_MOBILE_STATE',
        payload: window.innerWidth < 768,
      });
    };

    // Проверка при монтировании
    checkIfMobile();

    // Обработчик изменения размера окна
    window.addEventListener('resize', checkIfMobile);

    // Отписка при размонтировании
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Отслеживание прокрутки страницы
  useEffect(() => {
    const checkIfScrolled = () => {
      const scrollTop = window.pageYOffset;
      if (scrollTop > 10) {
        dispatch({ type: 'SET_SCROLLED_STATE', payload: true });
      } else {
        dispatch({ type: 'SET_SCROLLED_STATE', payload: false });
      }
    };

    window.addEventListener('scroll', checkIfScrolled);
    return () => window.removeEventListener('scroll', checkIfScrolled);
  }, []);

  // Обработчик клика на таб
  const handleTabClick = useCallback((tabName: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabName });
  }, []);

  // Выбор нужных вариантов анимации в зависимости от устройства
  const activeVariants = useMemo(
    () => (state.isMobile || asFooter ? mobileTabVariants : tabVariants),
    [state.isMobile, asFooter]
  );

  // Выбор варианта анимации появления
  const getAppearAnimation = useCallback(() => {
    switch (appearEffect) {
      case 'fade-in':
        return { initial: { opacity: 0 }, animate: { opacity: 1 } };
      case 'slide-up':
        return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
      case 'slide-down':
        return { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } };
      default:
        return {};
    }
  }, [appearEffect]);

  // Получение классов выравнивания
  const getAlignmentClasses = useCallback(() => {
    if (state.isMobile || asFooter) return '';

    const alignmentMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    return alignmentMap[alignment] || 'justify-center';
  }, [alignment, state.isMobile, asFooter]);

  // Определение типа навигации и классов
  const isTabbar = state.isMobile || asFooter;
  const navPosition = asFooter ? 'fixed bottom-0 left-0 right-0 z-50' : '';
  const navBackgroundClasses = transparent
    ? 'bg-transparent'
    : darkMode
      ? 'bg-gray-900 dark:bg-gray-900'
      : state.isScrolled
        ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg'
        : 'bg-gray-100 dark:bg-gray-800';

  return (
    <motion.nav
      className={`w-full transition-all duration-300 ${navPosition} ${className}`}
      initial={appearEffect !== 'none' ? 'hidden' : undefined}
      animate={appearEffect !== 'none' ? 'visible' : undefined}
      variants={containerVariants}
      {...(appearEffect !== 'none' ? getAppearAnimation() : {})}
    >
      <div
        className={`flex ${
          isTabbar ? 'flex-row overflow-x-auto' : 'flex-row'
        } ${getAlignmentClasses()} gap-1 p-2 rounded-xl ${navBackgroundClasses}`}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = state.activeTab === item.name;
          const hasBadge = item.badge !== undefined;

          return (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <RouterLink
                to={item.url}
                className={`relative flex items-center justify-center ${
                  isTabbar ? 'flex-col py-2 px-3' : 'p-2 px-4'
                } gap-2 rounded-lg cursor-pointer transition-colors duration-200
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:dark:text-primary-300'
                  }`}
                onClick={() => handleTabClick(item.name)}
              >
                {/* Иконка */}
                <div className="relative flex items-center justify-center w-6 h-6">
                  <Icon />

                  {/* Бейдж */}
                  {hasBadge && (
                    <motion.div
                      className={`absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs text-white rounded-full bg-${item.badge?.color}-500`}
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      {item.badge?.content}
                    </motion.div>
                  )}
                </div>

                {/* Название */}
                <span className={`${isTabbar ? 'text-xs' : 'text-sm'} font-medium`}>
                  {item.name}
                </span>

                {/* Эффект подсветки */}
                <motion.div
                  className={`absolute ${
                    isTabbar
                      ? 'bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary-500 dark:bg-primary-400 rounded-full'
                      : 'top-1/2 -translate-y-1/2 right-2 h-8 rounded-md bg-primary-100 dark:bg-primary-900/20'
                  }`}
                  initial="inactive"
                  animate={isActive ? 'active' : 'inactive'}
                  variants={activeVariants}
                />
              </RouterLink>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
