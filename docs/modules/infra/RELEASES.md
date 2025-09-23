# AquaStream Release Process

This document describes the complete release process for AquaStream backend services, including versioning rules, automation, and manual procedures.

## Semantic Versioning (SemVer)

AquaStream follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Version numbers are structured as `MAJOR.MINOR.PATCH`:

### Version Increment Rules

#### MAJOR version (X.0.0)
Increment when making **incompatible API changes**:
- ❌ Breaking changes to REST API endpoints
- ❌ Database schema changes requiring migration
- ❌ Removal of public APIs or configuration options
- ❌ Changes to message formats or protocols
- ❌ Major architectural changes affecting integrations

**Examples:**
- Removing `/api/v1/notifications` endpoint
- Changing required fields in notification request payload
- Moving from PostgreSQL to different database system

#### MINOR version (X.Y.0)  
Increment when adding **functionality in backward-compatible manner**:
- ✅ New REST API endpoints
- ✅ New optional configuration parameters
- ✅ New features that don't break existing functionality
- ✅ Database schema additions (new tables/columns)
- ✅ Performance improvements
- ✅ New environment profiles or deployment options

**Examples:**
- Adding `/api/v1/notifications/templates` endpoint
- Adding optional `priority` field to notification payload
- Implementing new rate limiting algorithms
- Adding Telegram webhook support alongside polling

#### PATCH version (X.Y.Z)
Increment when making **backward-compatible bug fixes**:
- 🐛 Bug fixes that don't change API behavior
- 🐛 Security patches
- 🐛 Performance optimizations
- 🐛 Documentation improvements
- 🐛 Test improvements
- 🐛 Internal refactoring without external impact

**Examples:**
- Fixing memory leak in metrics collection
- Correcting Telegram message encoding issues
- Improving error handling without changing response format

## Release Workflow

### Automated Releases

Releases are automatically triggered when pushing SemVer tags:

```bash
# Create and push a new tag
git tag v1.2.3
git push origin v1.2.3
```text

This triggers the GitHub Actions release workflow:

1. **Build & Test**: Compile all services and run unit tests
2. **Docker Build**: Create tagged Docker images
3. **Push Images**: Push to GitHub Container Registry (GHCR)
4. **Create Release**: Generate GitHub release with notes

### Manual Release Process

#### 1. Pre-Release Checklist

- [ ] All tests pass in CI/CD pipeline
- [ ] Code review completed and approved
- [ ] CHANGELOG.md updated with new version
- [ ] Database migrations tested (if applicable)
- [ ] Dependencies security scanned
- [ ] Performance benchmarks validated
- [ ] Documentation updated

#### 2. Determine Version Number

Follow SemVer rules above to determine if this is a MAJOR, MINOR, or PATCH release.

**Current version check:**
```bash
git describe --tags --abbrev=0
```

#### 3. Update CHANGELOG.md

Add new version entry at the top of the changelog:

```markdown
## [1.2.3] - 2025-08-18

### Added
- New notification template system
- Support for rich text formatting

### Fixed  
- Memory leak in Redis connection pooling
- Race condition in rate limiting service
```text

#### 4. Create and Push Tag

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create annotated tag with release notes
git tag -a v1.2.3 -m "Release v1.2.3

Added:
- Notification template system  
- Rich text formatting support

Fixed:
- Memory leak in Redis connection pooling
- Rate limiting race condition
"

# Push tag to trigger release
git push origin v1.2.3
```

#### 5. Verify Release

1. **GitHub Actions**: Check workflow completion at `https://github.com/YOUR_ORG/aquastream/actions`
2. **Docker Images**: Verify images at `https://github.com/YOUR_ORG/aquastream/pkgs/container/aquastream-backend-notification`
3. **Release Notes**: Check generated release at `https://github.com/YOUR_ORG/aquastream/releases`

## Docker Image Tagging

Docker images are automatically tagged based on the release type:

### Release Tags (vX.Y.Z)
```
ghcr.io/YOUR_ORG/aquastream-backend-notification:v1.2.3
ghcr.io/YOUR_ORG/aquastream-backend-notification:latest
```

### Development Tags
```
ghcr.io/YOUR_ORG/aquastream-backend-notification:sha-a1b2c3d
ghcr.io/YOUR_ORG/aquastream-backend-notification:latest
```

## Environment Deployment

### Staging Deployment
- **Trigger**: Any tag push
- **Images**: Uses exact version tags (`v1.2.3`)
- **Database**: Staging PostgreSQL with migration validation
- **Tests**: Full integration test suite

### Production Deployment  
- **Trigger**: Manual approval after staging validation
- **Images**: Promoted from staging (same tags)
- **Database**: Production PostgreSQL with careful migration
- **Monitoring**: Enhanced observability and alerting

## Release Validation

### Automated Validation
1. **Unit Tests**: All services pass unit test suite
2. **Integration Tests**: Cross-service communication validated
3. **Security Scanning**: Docker images scanned for vulnerabilities
4. **Performance Tests**: Baseline performance benchmarks
5. **Database Migration**: Liquibase migrations validated

### Manual Validation
1. **Smoke Tests**: Core functionality verification
2. **API Contract**: Backward compatibility validation
3. **Documentation**: Release notes and documentation accuracy
4. **Rollback Plan**: Verified rollback procedures

## Hotfix Process

For critical production issues requiring immediate patches:

### 1. Create Hotfix Branch
```bash
# From main branch
git checkout -b hotfix/v1.2.4 v1.2.3
```

### 2. Apply Critical Fix
```bash
# Make minimal changes
git commit -m "fix: critical security vulnerability in auth"
```

### 3. Test and Release
```bash
# Fast-track testing
./scripts/run-critical-tests.sh

# Create hotfix tag
git tag -a v1.2.4 -m "Hotfix v1.2.4 - Security patch"
git push origin v1.2.4
```

### 4. Merge Back
```bash
# Merge hotfix back to main
git checkout main
git merge hotfix/v1.2.4
git push origin main
```

## Release Notes Generation

GitHub releases use automatically generated release notes based on:

- **Pull Request Labels**: `feature`, `bugfix`, `breaking-change`, `security`
- **Conventional Commits**: Standard format for automatic categorization
- **CHANGELOG.md**: Manual curation of important changes

### PR Label Guidelines
- `feature` → "New Features" section
- `enhancement` → "Improvements" section  
- `bugfix` → "Bug Fixes" section
- `breaking-change` → "Breaking Changes" section
- `security` → "Security" section
- `documentation` → "Documentation" section

## Rollback Procedures

### Quick Rollback (Docker Images)
```bash
# Rollback to previous version in Kubernetes/Docker
kubectl set image deployment/notification-api \
  notification-api=ghcr.io/YOUR_ORG/aquastream-backend-notification:v1.2.2
```

### Database Rollback
```bash
# Liquibase rollback to previous tag
./gradlew liquibaseRollback -PliquibaseCommandValue=v1.2.2
```

### Full Environment Rollback
1. **Traffic Routing**: Redirect traffic to previous version
2. **Database Migration**: Rollback schema changes if needed
3. **Configuration**: Revert configuration changes
4. **Monitoring**: Enhanced monitoring during rollback period

## Monitoring and Alerts

### Release Health Monitoring
- **Error Rates**: Monitor for increased 5xx responses
- **Latency**: Track P95/P99 response times
- **Throughput**: Monitor requests per second
- **Database**: Connection pools, query performance
- **Redis**: Memory usage, connection counts

### Release Alerts
- **Critical**: Error rate > 5% for 5 minutes
- **Warning**: Latency increase > 50% from baseline
- **Info**: New version deployment completion

## Release Calendar

### Regular Release Schedule
- **Minor Releases**: Every 2 weeks (Sprint boundary)
- **Patch Releases**: As needed for critical fixes
- **Major Releases**: Quarterly or for significant features

### Release Windows
- **Preferred**: Tuesday-Thursday, 10 AM - 2 PM UTC
- **Avoided**: Friday afternoons, weekends, holidays
- **Emergency**: 24/7 for critical security issues

## Tools and Scripts

### Release Helper Scripts
```bash
# Check current version
./scripts/current-version.sh

# Validate changelog format
./scripts/validate-changelog.sh

# Generate release notes
./scripts/generate-release-notes.sh v1.2.3

# Test Docker image locally
./scripts/test-image.sh ghcr.io/YOUR_ORG/aquastream-backend-notification:v1.2.3
```

### CI/CD Integration
- **GitHub Actions**: `.github/workflows/release.yml`
- **Docker Registry**: GitHub Container Registry (GHCR)
- **Security Scanning**: Integrated vulnerability scanning
- **Release Automation**: Automatic changelog and release notes

## Troubleshooting

### Common Issues

#### Release Workflow Fails
1. Check GitHub Actions logs
2. Verify Docker build context
3. Validate SemVer tag format
4. Ensure sufficient permissions

#### Docker Image Push Fails
1. Verify GHCR authentication
2. Check repository permissions
3. Validate image size limits
4. Review network connectivity

#### Database Migration Issues
1. Validate migration scripts locally
2. Check database connectivity
3. Verify schema permissions
4. Test rollback procedures

### Emergency Contacts
- **DevOps Team**: devops@aquastream.org
- **Security Team**: security@aquastream.org  
- **On-Call Engineer**: oncall@aquastream.org

## Compliance and Audit

### Release Audit Trail
- All releases tracked in GitHub
- Docker images signed and scanned
- Change approval process documented
- Rollback procedures tested regularly

### Compliance Requirements
- SOC 2: Change management controls
- ISO 27001: Security release procedures
- GDPR: Data handling in releases
- Industry Standards: Following best practices

---

For questions or improvements to this process, please create an issue in the repository or contact the DevOps team.