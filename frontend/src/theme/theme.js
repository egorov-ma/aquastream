import { createTheme } from '@mui/material/styles';

// Цветовая палитра согласно требованиям
const colors = {
  primary: {
    main: '#00A8E8',  // бирюзово-синий для основных элементов
    light: '#33B5EC',
    dark: '#0086BA',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6F3D',  // оранжевый для второстепенных акцентов
    light: '#FF8F63',
    dark: '#E55A28',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',  // зеленый для успешных действий
    light: '#6FBF72',
    dark: '#3D8C40',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F44336',  // красный для ошибок
    light: '#F6685E',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9800',  // оранжевый для предупреждений
    light: '#FFAC33',
    dark: '#E68900',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',  // голубой для информационных элементов
    light: '#4DABF5',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F7F7F7',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  text: {
    primary: '#212121',   // основной текст - почти черный
    secondary: '#666666', // вторичный текст - темно-серый
    disabled: '#9E9E9E',
  },
  background: {
    default: '#FFFFFF',  // белый фон для страниц
    paper: '#F7F7F7',    // светло-серый для карточек
  },
  divider: '#E0E0E0',    // границы и разделители
};

// Создание темы Material-UI
const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '32px',
      lineHeight: 1.4,
    },
    h2: {
      fontWeight: 600,
      fontSize: '24px',
      lineHeight: 1.4,
    },
    h3: {
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: 1.5,
    },
    h4: {
      fontWeight: 600,
      fontSize: '16px',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '12px',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        sizeLarge: {
          padding: '12px 24px',
        },
        sizeSmall: {
          padding: '6px 12px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardMedia: {
      styleOverrides: {
        root: {
          height: '200px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.grey[800],
          color: '#FFFFFF',
          fontSize: '12px',
          borderRadius: '4px',
          padding: '8px 12px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[100],
          '& .MuiTableCell-head': {
            color: colors.text.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: colors.grey[50],
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
      },
    },
  },
});

export default theme; 