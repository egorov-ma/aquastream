# Development & DevOps Guide - AqStream

## Development Workflow

### Git Workflow

#### Branching Strategy (Git Flow)

```
main
  │
  ├── develop
  │     │
  │     ├── feature/AUTH-001-user-registration
  │     ├── feature/EVENT-023-search-filters
  │     └── feature/PAY-015-payment-confirmation
  │
  ├── release/v1.0.0
  │
  └── hotfix/FIX-042-critical-bug
```

#### Branch Naming Convention
- `feature/[TICKET-ID]-short-description`
- `bugfix/[TICKET-ID]-short-description`
- `hotfix/[TICKET-ID]-short-description`
- `release/v[MAJOR].[MINOR].[PATCH]`

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```bash
feat(auth): add JWT token refresh endpoint

Implement automatic token refresh to improve UX.
Users won't need to re-login frequently.

Closes #123

---

fix(events): correct timezone handling in event creation

Fixed issue where events were created with wrong timezone.
Now properly converts user timezone to UTC for storage.

Fixes #456
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Development Environment Setup

#### Prerequisites Installation

```bash
# Backend requirements
brew install java@21
brew install gradle
brew install postgresql@15
brew install redis
brew install minio

# Frontend requirements
brew install node@20
brew install yarn

# Additional tools
brew install docker
brew install docker-compose
brew install git
```

#### Local Environment Configuration

```bash
# 1. Clone repository
git clone https://github.com/aqstream/aqstream.git
cd aqstream

# 2. Setup backend
cd backend
cp .env.example .env
# Edit .env with local settings

# 3. Start infrastructure
docker-compose -f docker-compose.dev.yml up -d postgres redis minio

# 4. Run database migrations
./gradlew liquibaseUpdate

# 5. Start backend
./gradlew bootRun

# 6. Setup frontend (new terminal)
cd ../frontend
cp .env.local.example .env.local
yarn install
yarn dev
```

#### Environment Variables

Backend `.env`:
```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aqstream_dev
DB_USER=aqstream
DB_PASSWORD=dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRATION=900000

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain/webhook

# Application
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
LOG_LEVEL=DEBUG
```

Frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_ENVIRONMENT=development
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Main CI Pipeline

`.github/workflows/ci.yml`:
```yaml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
    
    - name: Cache Gradle packages
      uses: actions/cache@v3
      with:
        path: ~/.gradle/caches
        key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle') }}
    
    - name: Run tests
      working-directory: ./backend
      run: |
        ./gradlew test
        ./gradlew jacocoTestReport
    
    - name: Run ArchUnit tests
      working-directory: ./backend
      run: ./gradlew archTest
    
    - name: SonarQube analysis
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      run: ./gradlew sonarqube
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/build/reports/jacoco/test/jacocoTestReport.xml

  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'yarn'
        cache-dependency-path: frontend/yarn.lock
    
    - name: Install dependencies
      working-directory: ./frontend
      run: yarn install --frozen-lockfile
    
    - name: Run linting
      working-directory: ./frontend
      run: yarn lint
    
    - name: Run type checking
      working-directory: ./frontend
      run: yarn type-check
    
    - name: Run tests
      working-directory: ./frontend
      run: yarn test:ci
    
    - name: Build application
      working-directory: ./frontend
      run: yarn build

  e2e-test:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Start services
      run: docker-compose -f docker-compose.test.yml up -d
    
    - name: Wait for services
      run: |
        ./scripts/wait-for-it.sh localhost:8080 -t 60
        ./scripts/wait-for-it.sh localhost:3000 -t 60
    
    - name: Run E2E tests
      working-directory: ./frontend
      run: yarn test:e2e
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: frontend/test-results/

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy results to GitHub Security
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

#### Deployment Pipeline

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          aqstream/backend:latest
          aqstream/backend:${{ github.ref_name }}
        cache-from: type=registry,ref=aqstream/backend:buildcache
        cache-to: type=registry,ref=aqstream/backend:buildcache,mode=max
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: |
          aqstream/frontend:latest
          aqstream/frontend:${{ github.ref_name }}

  deploy-staging:
    if: github.event.inputs.environment == 'staging' || github.ref_type == 'tag'
    needs: build-and-push
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /opt/aqstream
          docker-compose pull
          docker-compose up -d --no-deps
          docker system prune -f

  deploy-production:
    if: github.event.inputs.environment == 'production'
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/aqstream
          ./scripts/deploy-prod.sh ${{ github.ref_name }}
```

## Testing Strategy

### Backend Testing

#### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class EventServiceTest {
    
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private NotificationService notificationService;
    
    @InjectMocks
    private EventService eventService;
    
    @Test
    void shouldCreateEvent() {
        // Given
        EventCreateDto dto = EventCreateDto.builder()
            .title("Test Event")
            .build();
        
        Event savedEvent = Event.builder()
            .id(UUID.randomUUID())
            .title("Test Event")
            .build();
        
        when(eventRepository.save(any())).thenReturn(savedEvent);
        
        // When
        EventDto result = eventService.createEvent(dto);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Event");
        verify(notificationService).sendEventCreated(any());
    }
}
```

#### Integration Tests
```java
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class EventControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "ORGANIZER")
    void shouldCreateEventEndpoint() throws Exception {
        String eventJson = """
            {
                "title": "Integration Test Event",
                "description": "Test Description",
                "startDate": "2024-12-01T10:00:00Z"
            }
            """;
        
        mockMvc.perform(post("/api/v1/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eventJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Event"));
    }
}
```

#### Container Tests
```java
@SpringBootTest
@Testcontainers
class DatabaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("aqstream_test")
            .withUsername("test")
            .withPassword("test");
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Test
    void contextLoads() {
        assertThat(postgres.isRunning()).isTrue();
    }
}
```

### Frontend Testing

#### Unit Tests
```typescript
// EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';

describe('EventCard', () => {
  it('should render event information', () => {
    const event = {
      id: '1',
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date('2024-12-01'),
    };
    
    render(<EventCard event={event} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

#### E2E Tests
```typescript
// event-creation.spec.ts
import { test, expect } from '@playwright/test';

test('organizer can create event', async ({ page }) => {
  // Login as organizer
  await page.goto('/login');
  await page.fill('[name=email]', 'organizer@test.com');
  await page.fill('[name=password]', 'password');
  await page.click('[type=submit]');
  
  // Navigate to event creation
  await page.goto('/events/new');
  
  // Fill event form
  await page.fill('[name=title]', 'E2E Test Event');
  await page.fill('[name=description]', 'This is a test event');
  await page.fill('[name=startDate]', '2024-12-01T10:00');
  
  // Submit form
  await page.click('[type=submit]');
  
  // Verify success
  await expect(page).toHaveURL(/\/events\/\d+/);
  await expect(page.locator('h1')).toContainText('E2E Test Event');
});
```

## Code Quality

### Linting & Formatting

#### Backend (Checkstyle)
`config/checkstyle/checkstyle.xml`:
```xml
<?xml version="1.0"?>
<!DOCTYPE module PUBLIC
  "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
  "https://checkstyle.org/dtds/configuration_1_3.dtd">

<module name="Checker">
  <module name="TreeWalker">
    <module name="LineLength">
      <property name="max" value="120"/>
    </module>
    <module name="MethodLength">
      <property name="max" value="50"/>
    </module>
    <module name="CyclomaticComplexity">
      <property name="max" value="10"/>
    </module>
  </module>
</module>
```

#### Frontend (ESLint)
`.eslintrc.json`:
```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Pre-commit Hooks

`.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Backend checks
cd backend
./gradlew spotlessCheck

# Frontend checks
cd ../frontend
yarn lint-staged
```

`lint-staged.config.js`:
```javascript
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss}': ['stylelint --fix', 'prettier --write'],
  '*.{json,md,yml}': ['prettier --write'],
};
```

## Monitoring & Logging

### Application Metrics

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'aqstream-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "AqStream Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time P95",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_server_requests_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

### Centralized Logging

```yaml
# filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
    - add_docker_metadata:
        host: "unix:///var/run/docker.sock"

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "aqstream-%{+yyyy.MM.dd}"
```

## Security Practices

### SAST (Static Application Security Testing)

```yaml
# .github/workflows/security.yml
- name: Run SAST with Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/owasp-top-ten
      p/jwt

- name: Dependency check
  run: ./gradlew dependencyCheckAnalyze
```

### Secrets Management

```bash
# Using GitHub Secrets for CI/CD
gh secret set DB_PASSWORD --body "$DB_PASSWORD"
gh secret set JWT_SECRET --body "$JWT_SECRET"
gh secret set TELEGRAM_TOKEN --body "$TELEGRAM_TOKEN"

# Local development with .env files
# Never commit .env files!
echo ".env" >> .gitignore
```

### Security Headers

```java
@Configuration
public class WebSecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.headers(headers -> headers
            .contentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'")
            .frameOptions(FrameOptionsConfig::sameOrigin)
            .httpStrictTransportSecurity(hsts -> hsts
                .includeSubDomains(true)
                .maxAgeInSeconds(31536000))
        );
        return http.build();
    }
}
```

## Release Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes

### Release Process

```bash
# 1. Create release branch
git checkout -b release/v1.2.0 develop

# 2. Update version
./scripts/update-version.sh 1.2.0

# 3. Generate changelog
./scripts/generate-changelog.sh > CHANGELOG.md

# 4. Commit changes
git commit -am "chore: prepare release v1.2.0"

# 5. Merge to main
git checkout main
git merge --no-ff release/v1.2.0

# 6. Tag release
git tag -a v1.2.0 -m "Release version 1.2.0"

# 7. Push changes
git push origin main --tags

# 8. Merge back to develop
git checkout develop
git merge --no-ff main
```

### Rollback Procedures

```bash
#!/bin/bash
# rollback.sh

VERSION=$1

echo "Rolling back to version $VERSION"

# Stop current deployment
docker-compose stop

# Pull previous version
docker pull aqstream/backend:$VERSION
docker pull aqstream/frontend:$VERSION

# Update docker-compose
sed -i "s|aqstream/backend:.*|aqstream/backend:$VERSION|g" docker-compose.yml
sed -i "s|aqstream/frontend:.*|aqstream/frontend:$VERSION|g" docker-compose.yml

# Start services
docker-compose up -d

# Run rollback migrations if needed
docker exec aqstream_backend ./gradlew liquibaseRollback -Dliquibase.rollbackTag=$VERSION

echo "Rollback completed"
```

## Documentation

### API Documentation

```java
@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Events", description = "Event management endpoints")
public class EventController {
    
    @Operation(
        summary = "Create new event",
        description = "Creates a new event. Requires ORGANIZER role."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Event created successfully",
            content = @Content(schema = @Schema(implementation = EventDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data"
        )
    })
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<EventDto> createEvent(
        @Valid @RequestBody EventCreateDto dto
    ) {
        // Implementation
    }
}
```

### README Template

```markdown
# AqStream

[![CI](https://github.com/aqstream/aqstream/workflows/CI/badge.svg)](https://github.com/aqstream/aqstream/actions)
[![Coverage](https://codecov.io/gh/aqstream/aqstream/branch/main/graph/badge.svg)](https://codecov.io/gh/aqstream/aqstream)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Quick Start

\```bash
# Clone and run
git clone https://github.com/aqstream/aqstream.git
cd aqstream
docker-compose up
\```

Visit http://localhost:3000

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) file.
```

## Team Collaboration

### Code Review Process

1. Create feature branch
2. Make changes and commit
3. Push branch and create PR
4. Automated checks run
5. Request review from team
6. Address feedback
7. Merge after approval

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots (if applicable)
```
