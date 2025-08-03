# Common Module Optimization

## Выполненные изменения

### 1. Реорганизация по доменам

Структура common модуля была реорганизована по доменам для улучшения читаемости и поддерживаемости:

```
org.aquastream.common/
├── domain/
│   ├── auth/          # Аутентификация и авторизация
│   │   ├── JwtResponse.java
│   │   ├── LoginRequest.java
│   │   ├── MessageResponse.java
│   │   ├── SignupRequest.java
│   │   └── ErrorResponse.java
│   ├── user/          # Пользователи
│   │   ├── UserDto.java
│   │   └── ERole.java
│   └── event/         # События
│       └── PlanDto.java
├── utils/             # Утилиты
│   ├── DateUtils.java
│   └── ValidationUtils.java
└── exception/         # Исключения
    ├── BusinessException.java
    ├── ValidationException.java
    ├── ResourceNotFoundException.java
    ├── AccessDeniedException.java
    ├── ConflictException.java
    ├── ExceptionUtils.java
    └── CustomException.java (deprecated)
```

### 2. Общие утилиты

#### DateUtils
Класс для работы с датами и временем:
- Форматирование и парсинг дат
- Конверсия между Date и LocalDateTime
- Операции с датами (добавление дней/часов, вычисление разности)
- Проверки (прошлое/будущее/сегодня)
- Получение начала/конца дня

#### ValidationUtils
Класс для валидации данных:
- Проверка email, телефона, username
- Валидация паролей
- Проверка длины строк
- Нормализация данных (телефон, Telegram username)
- Проверка типов данных (алфавитные, цифровые, алфавитно-цифровые)

### 3. Стратегия обработки исключений

#### Иерархия исключений
- `BusinessException` - базовое исключение для бизнес-логики
- `ValidationException` - ошибки валидации с поддержкой field errors
- `ResourceNotFoundException` - ресурс не найден
- `AccessDeniedException` - отказ в доступе
- `ConflictException` - конфликт данных (дублирование и т.д.)

#### ExceptionUtils
Утилитный класс для создания типизированных исключений:
```java
// Примеры использования
throw ExceptionUtils.userNotFound(userId);
throw ExceptionUtils.validationError("email", "Invalid email format");
throw ExceptionUtils.emailAlreadyExists(email);
throw ExceptionUtils.accessDenied("event", "delete");
```

#### ErrorResponse
Стандартизированный формат ответа для ошибок API с поддержкой:
- Временной метки
- HTTP статуса и описания
- Сообщения об ошибке
- Кода ошибки
- Field errors для валидации
- Пути запроса

## Миграция существующего кода

### Обновление imports
Старые пути:
```java
import org.aquastream.common.dto.UserDto;
import org.aquastream.common.dto.auth.LoginRequest;
import org.aquastream.common.exceptions.CustomException;
```

Новые пути:
```java
import org.aquastream.common.domain.user.UserDto;
import org.aquastream.common.domain.auth.LoginRequest;
import org.aquastream.common.exception.BusinessException;
```

### Замена CustomException
Вместо:
```java
throw new CustomException("Error message");
```

Используйте:
```java
throw ExceptionUtils.businessError("Error message");
// или более специфичные:
throw ExceptionUtils.userNotFound(userId);
throw ExceptionUtils.validationError(fieldErrors);
```

## Интеграция с Spring Boot

Для интеграции с Spring Boot службами, создайте `GlobalExceptionHandler` в каждом service модуле:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        // обработка исключений
    }
}
```

## Преимущества

1. **Улучшенная организация**: Логическое группирование по доменам
2. **Переиспользование**: Общие утилиты доступны всем модулям
3. **Типизированные исключения**: Четкая иерархия и обработка ошибок
4. **Стандартизация**: Единый формат ответов об ошибках
5. **Поддерживаемость**: Легче навигировать и понимать код
6. **Безопасность**: Утилиты валидации помогают предотвратить ошибки