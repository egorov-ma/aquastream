---
title: "Changelog — Infra"
summary: "История изменений инфраструктуры AquaStream по Keep a Changelog и SemVer."
---
# Changelog — Infra

Все заметные изменения в инфраструктуре документируются здесь. Формат — Keep a Changelog, версияция — SemVer.

## [Unreleased]
### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

---

## Release History

<!-- Releases will be automatically added here -->

## [1.0.0] - 2025-08-18

### Added
- Initial release of AquaStream backend services
- Notification service with Telegram Bot API integration
- Metrics collection system with Redis backend
- Rate limiting with Bucket4j and token bucket algorithm
- Environment profiles (dev/stage/prod) with mock system
- Spring Boot Actuator health checks and monitoring
- Database migrations with Liquibase
- Docker containerization and GitHub Actions CI/CD
- Comprehensive test coverage

### Infrastructure
- PostgreSQL database with schema per service
- Redis for metrics aggregation and rate limiting
- Docker Compose development environment
- GitHub Actions workflows for CI/CD and releases
- SemVer versioning and automated changelog generation

---

## Version Guidelines

This project follows Semantic Versioning. Version numbers are structured as MAJOR.MINOR.PATCH:

- MAJOR: Incompatible API changes or major architectural changes
- MINOR: New functionality in backward-compatible manner
- PATCH: Backward-compatible bug fixes

### Release Types

- 🚀 Major Release (X.0.0): Breaking changes, new major features
- ✨ Minor Release (X.Y.0): New features, enhancements, non-breaking API changes  
- 🐛 Patch Release (X.Y.Z): Bug fixes, security patches, minor improvements

### Change Categories

- Added 🆕: New features
- Changed 🔄: Changes in existing functionality
- Deprecated ⚠️: Soon-to-be removed features
- Removed ❌: Removed features
- Fixed 🐛: Bug fixes
- Security 🔒: Security improvements
