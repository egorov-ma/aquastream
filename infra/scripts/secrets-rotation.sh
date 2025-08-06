#!/bin/bash

# AquaStream Secrets Rotation Strategy Implementation
# Automated rotation of secrets with audit trail and rollback capabilities
# Secrets are expected to be stored in GitHub Secrets and passed to containers
# via environment variables or --env-file, never committed to the repository

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
ENV_FILE="$PROJECT_ROOT/infra/docker/compose/.env"
ROTATION_LOG_DIR="$PROJECT_ROOT/infra/scripts/rotation-logs"
SECRETS_BACKUP_DIR="$PROJECT_ROOT/infra/scripts/secrets-backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$rotation_log_file"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$rotation_log_file"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$rotation_log_file"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$rotation_log_file"
}

# Initialize logging
init_logging() {
    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    mkdir -p "$ROTATION_LOG_DIR"
    rotation_log_file="$ROTATION_LOG_DIR/rotation_$timestamp.log"
    
    log_info "=== AquaStream Secrets Rotation Started ==="
    log_info "Log file: $rotation_log_file"
}

# Configuration for rotation schedule
declare -A SECRET_ROTATION_CONFIG=(
    ["POSTGRES_PASSWORD"]="30"    # days
    ["ELASTIC_PASSWORD"]="30"     # days
    ["KIBANA_PASSWORD"]="30"      # days
    ["GRAFANA_ADMIN_PASSWORD"]="30" # days
    ["JWT_SECRET"]="15"           # days
    ["ENCRYPTION_KEY"]="15"       # days
)

# Check if secret needs rotation
needs_rotation() {
    local secret_name="$1"
    local max_age_days="${SECRET_ROTATION_CONFIG[$secret_name]:-30}"
    
    # Find the latest backup for this secret
    local latest_backup
    latest_backup=$(find "$SECRETS_BACKUP_DIR" -name "secrets_backup_*_${secret_name}.env" -type f -exec ls -t {} + 2>/dev/null | head -1 || echo "")
    
    if [[ -z "$latest_backup" ]]; then
        log_info "No previous backup found for $secret_name - rotation needed"
        return 0
    fi
    
    # Extract timestamp from backup filename
    local backup_timestamp
    backup_timestamp=$(basename "$latest_backup" | sed 's/secrets_backup_\([0-9]\{8\}_[0-9]\{6\}\)_.*/\1/')
    
    # Convert to seconds since epoch
    local backup_date
    backup_date=$(date -d "${backup_timestamp:0:8} ${backup_timestamp:9:2}:${backup_timestamp:11:2}:${backup_timestamp:13:2}" +%s 2>/dev/null || echo "0")
    
    local current_date
    current_date=$(date +%s)
    local age_days=$(( (current_date - backup_date) / 86400 ))
    
    if [[ $age_days -ge $max_age_days ]]; then
        log_info "$secret_name is $age_days days old (max: $max_age_days) - rotation needed"
        return 0
    else
        log_info "$secret_name is $age_days days old (max: $max_age_days) - rotation not needed"
        return 1
    fi
}

# Generate cryptographically secure password
generate_secure_password() {
    local length=${1:-32}
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -base64 $((length * 3 / 4)) | tr -d "=+/" | cut -c1-"${length}"
    elif command -v python3 >/dev/null 2>&1; then
        python3 -c "import secrets, string; print(''.join(secrets.choice(string.ascii_letters + string.digits + '@#%^&*') for _ in range(${length})))"
    else
        log_error "Neither openssl nor python3 available for secure password generation"
        exit 1
    fi
}

# Create audit trail entry
create_audit_entry() {
    local secret_name="$1"
    local action="$2"
    local status="$3"
    local details="$4"
    
    local audit_file="$ROTATION_LOG_DIR/audit_trail.log"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local user
    user=$(whoami)
    
    echo "$timestamp,$user,$secret_name,$action,$status,$details" >> "$audit_file"
}

# Backup current secret
backup_secret() {
    local secret_name="$1"
    local current_value="$2"
    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    
    mkdir -p "$SECRETS_BACKUP_DIR"
    
    local backup_file="$SECRETS_BACKUP_DIR/secrets_backup_${timestamp}_${secret_name}.env"
    echo "${secret_name}=${current_value}" > "$backup_file"
    chmod 600 "$backup_file"
    
    log_info "Backed up $secret_name to $backup_file"
    create_audit_entry "$secret_name" "BACKUP" "SUCCESS" "Backup created: $backup_file"
}

# Update secret in environment file
update_secret_in_env() {
    local secret_name="$1"
    local new_value="$2"
    
    if [[ -f "$ENV_FILE" ]]; then
        # Create backup of entire .env file
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Update the secret without using sed
        local tmp_file="${ENV_FILE}.tmp"
        local updated=false
        : > "$tmp_file"

        while IFS= read -r line; do
            if [[ $line == "${secret_name}="* ]]; then
                printf '%s=%s\n' "$secret_name" "$new_value" >> "$tmp_file"
                updated=true
            else
                printf '%s\n' "$line" >> "$tmp_file"
            fi
        done < "$ENV_FILE"

        if [[ $updated == false ]]; then
            printf '%s=%s\n' "$secret_name" "$new_value" >> "$tmp_file"
            log_success "Added $secret_name to $ENV_FILE"
        else
            log_success "Updated $secret_name in $ENV_FILE"
        fi

        mv "$tmp_file" "$ENV_FILE"
    else
        log_error "Environment file not found: $ENV_FILE"
        return 1
    fi
}

# Update Docker secret
update_docker_secret() {
    local secret_name="$1"
    local new_value="$2"
    local docker_secret_name
    docker_secret_name="aquastream_$(echo "$secret_name" | tr '[:upper:]' '[:lower:]')"
    
    # Check if Docker Swarm is active
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
        log_warning "Docker Swarm not active - skipping Docker secret update"
        return 0
    fi
    
    # Remove existing secret if it exists
    if docker secret ls --format "{{.Name}}" | grep -q "^${docker_secret_name}$"; then
        log_info "Removing existing Docker secret: $docker_secret_name"
        docker secret rm "$docker_secret_name" || {
            log_error "Failed to remove existing Docker secret: $docker_secret_name"
            return 1
        }
    fi
    
    # Create new secret
    echo "$new_value" | docker secret create "$docker_secret_name" - || {
        log_error "Failed to create Docker secret: $docker_secret_name"
        return 1
    }
    
    log_success "Updated Docker secret: $docker_secret_name"
}

# Rotate single secret
rotate_secret() {
    local secret_name="$1"
    local force_rotation="${2:-false}"
    
    log_info "Processing secret rotation for: $secret_name"
    
    # Check if rotation is needed
    if [[ "$force_rotation" != "true" ]] && ! needs_rotation "$secret_name"; then
        log_info "Skipping rotation for $secret_name - not due"
        return 0
    fi
    
    # Get current value for backup
    local current_value
    if [[ -f "$ENV_FILE" ]] && grep -q "^${secret_name}=" "$ENV_FILE"; then
        current_value=$(grep "^${secret_name}=" "$ENV_FILE" | cut -d'=' -f2-)
        backup_secret "$secret_name" "$current_value"
    fi
    
    # Generate new secret
    local new_value
    case "$secret_name" in
        "JWT_SECRET"|"ENCRYPTION_KEY")
            new_value=$(generate_secure_password 64)
            ;;
        *)
            new_value=$(generate_secure_password 32)
            ;;
    esac
    
    log_info "Generated new value for $secret_name"
    
    # Update environment file
    if ! update_secret_in_env "$secret_name" "$new_value"; then
        create_audit_entry "$secret_name" "ROTATION" "FAILED" "Failed to update environment file"
        return 1
    fi
    
    # Update Docker secret
    if ! update_docker_secret "$secret_name" "$new_value"; then
        create_audit_entry "$secret_name" "ROTATION" "FAILED" "Failed to update Docker secret"
        return 1
    fi
    
    create_audit_entry "$secret_name" "ROTATION" "SUCCESS" "Secret rotated successfully"
    log_success "Successfully rotated secret: $secret_name"
}

# Rotate all secrets
rotate_all_secrets() {
    local force_rotation="${1:-false}"
    
    log_info "Starting rotation of all secrets (force: $force_rotation)"
    
    local total_secrets=${#SECRET_ROTATION_CONFIG[@]}
    local successful_rotations=0
    local failed_rotations=0
    
    for secret_name in "${!SECRET_ROTATION_CONFIG[@]}"; do
        if rotate_secret "$secret_name" "$force_rotation"; then
            successful_rotations=$((successful_rotations + 1))
        else
            failed_rotations=$((failed_rotations + 1))
        fi
    done
    
    log_info "Rotation summary: $successful_rotations/$total_secrets successful, $failed_rotations failed"
    
    if [[ $failed_rotations -gt 0 ]]; then
        log_error "Some secret rotations failed - manual intervention may be required"
        return 1
    fi
    
    return 0
}

# Verify service connectivity after rotation
verify_services() {
    log_info "Verifying service connectivity after rotation..."
    
    local compose_file="$PROJECT_ROOT/infra/docker/compose/docker-compose.yml"
    
    # Check if services are running
    local running_services
    running_services=$(docker compose -f "$compose_file" ps --services --filter "status=running" 2>/dev/null || echo "")
    
    if [[ -z "$running_services" ]]; then
        log_warning "No running services found - cannot verify connectivity"
        return 0
    fi
    
    # Test database connections
    if echo "$running_services" | grep -q "postgres"; then
        log_info "Testing PostgreSQL connectivity..."
        if docker compose -f "$compose_file" exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            log_success "PostgreSQL connectivity verified"
        else
            log_error "PostgreSQL connectivity failed"
            return 1
        fi
    fi
    
    # Test Elasticsearch
    if echo "$running_services" | grep -q "elasticsearch"; then
        log_info "Testing Elasticsearch connectivity..."
        if docker compose -f "$compose_file" exec -T elasticsearch curl -s http://localhost:9200/_cluster/health >/dev/null 2>&1; then
            log_success "Elasticsearch connectivity verified"
        else
            log_error "Elasticsearch connectivity failed"
            return 1
        fi
    fi
    
    log_success "Service connectivity verification completed"
}

# Cleanup old backups
cleanup_old_backups() {
    local retention_days="${1:-90}"
    
    log_info "Cleaning up backups older than $retention_days days"
    
    local deleted_count=0
    find "$SECRETS_BACKUP_DIR" -name "secrets_backup_*.env" -type f -mtime +"${retention_days}" -print0 2>/dev/null | \
    while IFS= read -r -d '' file; do
        log_info "Removing old backup: $(basename "$file")"
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
    done
    
    log_info "Cleanup completed - removed $deleted_count old backup files"
}

# Show rotation status
show_rotation_status() {
    log_info "=== Secrets Rotation Status ==="
    
    for secret_name in "${!SECRET_ROTATION_CONFIG[@]}"; do
        local max_age_days="${SECRET_ROTATION_CONFIG[$secret_name]}"
        
        local latest_backup
        latest_backup=$(find "$SECRETS_BACKUP_DIR" -name "secrets_backup_*_${secret_name}.env" -type f -exec ls -t {} + 2>/dev/null | head -1 || echo "")
        
        if [[ -z "$latest_backup" ]]; then
            echo "  $secret_name: Never rotated (max age: $max_age_days days)"
        else
            local backup_timestamp
            backup_timestamp=$(basename "$latest_backup" | sed 's/secrets_backup_\([0-9]\{8\}_[0-9]\{6\}\)_.*/\1/')
            
            local backup_date
            backup_date=$(date -d "${backup_timestamp:0:8} ${backup_timestamp:9:2}:${backup_timestamp:11:2}:${backup_timestamp:13:2}" +%s 2>/dev/null || echo "0")
            
            local current_date
            current_date=$(date +%s)
            local age_days=$(( (current_date - backup_date) / 86400 ))
            
            local status="OK"
            if [[ $age_days -ge $max_age_days ]]; then
                status="DUE FOR ROTATION"
            fi
            
            echo "  $secret_name: Last rotated $age_days days ago (max: $max_age_days days) - $status"
        fi
    done
}

# Rollback to previous secret version
rollback_secret() {
    local secret_name="$1"
    
    local latest_backup
    latest_backup=$(find "$SECRETS_BACKUP_DIR" -name "secrets_backup_*_${secret_name}.env" -type f -exec ls -t {} + 2>/dev/null | head -1 || echo "")
    
    if [[ -z "$latest_backup" ]]; then
        log_error "No backup found for $secret_name - cannot rollback"
        return 1
    fi
    
    local previous_value
    previous_value=$(grep "^${secret_name}=" "$latest_backup" | cut -d'=' -f2-)
    
    if [[ -z "$previous_value" ]]; then
        log_error "Could not extract previous value from backup"
        return 1
    fi
    
    log_info "Rolling back $secret_name to previous value from $latest_backup"
    
    # Update environment file
    if update_secret_in_env "$secret_name" "$previous_value"; then
        # Update Docker secret
        if update_docker_secret "$secret_name" "$previous_value"; then
            create_audit_entry "$secret_name" "ROLLBACK" "SUCCESS" "Rolled back from $latest_backup"
            log_success "Successfully rolled back $secret_name"
            return 0
        fi
    fi
    
    create_audit_entry "$secret_name" "ROLLBACK" "FAILED" "Failed to rollback from $latest_backup"
    log_error "Failed to rollback $secret_name"
    return 1
}

# Show usage
show_usage() {
    cat << EOF
AquaStream Secrets Rotation Management

Usage:
    $0 [COMMAND] [OPTIONS]

Commands:
    rotate-all [--force]        Rotate all secrets (force skips age check)
    rotate SECRET_NAME [--force] Rotate specific secret
    status                      Show rotation status for all secrets
    verify                      Verify service connectivity
    rollback SECRET_NAME        Rollback secret to previous version
    cleanup [DAYS]              Clean up old backups (default: 90 days)
    audit                       Show audit trail

Options:
    --force                     Force rotation regardless of age
    --help                      Show this help message

Examples:
    $0 rotate-all               # Rotate secrets that are due
    $0 rotate-all --force       # Force rotate all secrets
    $0 rotate POSTGRES_PASSWORD # Rotate only PostgreSQL password
    $0 status                   # Check rotation status
    $0 rollback JWT_SECRET      # Rollback JWT secret
    $0 cleanup 30               # Remove backups older than 30 days

Rotation Schedule:
EOF

    for secret_name in "${!SECRET_ROTATION_CONFIG[@]}"; do
        local max_age_days="${SECRET_ROTATION_CONFIG[$secret_name]}"
        echo "    $secret_name: Every $max_age_days days"
    done
}

# Show audit trail
show_audit_trail() {
    local audit_file="$ROTATION_LOG_DIR/audit_trail.log"
    
    if [[ ! -f "$audit_file" ]]; then
        log_info "No audit trail found"
        return 0
    fi
    
    echo "=== Secrets Rotation Audit Trail ==="
    echo "Timestamp,User,Secret,Action,Status,Details"
    echo "----------------------------------------"
    tail -50 "$audit_file" | sort -r
}

# Main execution
main() {
    init_logging
    
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        "rotate-all")
            local force_flag="false"
            if [[ "${1:-}" == "--force" ]]; then
                force_flag="true"
                shift || true
            fi
            rotate_all_secrets "$force_flag"
            verify_services
            ;;
        "rotate")
            local secret_name="${1:-}"
            if [[ -z "$secret_name" ]]; then
                log_error "Secret name required for rotation"
                show_usage
                exit 1
            fi
            shift || true
            
            local force_flag="false"
            if [[ "${1:-}" == "--force" ]]; then
                force_flag="true"
            fi
            
            if [[ -n "${SECRET_ROTATION_CONFIG[$secret_name]:-}" ]]; then
                rotate_secret "$secret_name" "$force_flag"
                verify_services
            else
                log_error "Unknown secret: $secret_name"
                exit 1
            fi
            ;;
        "status")
            show_rotation_status
            ;;
        "verify")
            verify_services
            ;;
        "rollback")
            local secret_name="${1:-}"
            if [[ -z "$secret_name" ]]; then
                log_error "Secret name required for rollback"
                show_usage
                exit 1
            fi
            rollback_secret "$secret_name"
            ;;
        "cleanup")
            local retention_days="${1:-90}"
            cleanup_old_backups "$retention_days"
            ;;
        "audit")
            show_audit_trail
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Error handling
trap 'log_error "Script failed on line $LINENO"' ERR

# Run main function
main "$@"