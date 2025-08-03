#!/bin/bash

# Setup automated secrets rotation using cron
# This script configures cron jobs for automated secrets rotation

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if cron is available
check_cron_availability() {
    if ! command -v crontab >/dev/null 2>&1; then
        log_error "crontab command not found. Please install cron."
        exit 1
    fi
    
    if ! systemctl is-active --quiet cron 2>/dev/null && ! systemctl is-active --quiet crond 2>/dev/null; then
        log_warning "Cron service may not be running. Please ensure cron daemon is active."
    fi
}

# Create cron job entries
create_cron_entries() {
    local cron_file="/tmp/aquastream_rotation_cron"
    
    cat > "$cron_file" << 'EOF'
# AquaStream Secrets Rotation Schedule
# Managed by setup-rotation-cron.sh - DO NOT EDIT MANUALLY

# Weekly rotation check (Sundays at 2:00 AM)
0 2 * * 0 /bin/bash AQUASTREAM_PROJECT_ROOT/infra/scripts/secrets-rotation.sh rotate-all >> /var/log/aquastream-rotation.log 2>&1

# Daily status check (Every day at 6:00 AM)
0 6 * * * /bin/bash AQUASTREAM_PROJECT_ROOT/infra/scripts/secrets-rotation.sh status >> /var/log/aquastream-rotation.log 2>&1

# Monthly cleanup of old backups (First day of month at 3:00 AM)
0 3 1 * * /bin/bash AQUASTREAM_PROJECT_ROOT/infra/scripts/secrets-rotation.sh cleanup 90 >> /var/log/aquastream-rotation.log 2>&1

# Service verification after rotation (Sundays at 2:30 AM)
30 2 * * 0 /bin/bash AQUASTREAM_PROJECT_ROOT/infra/scripts/secrets-rotation.sh verify >> /var/log/aquastream-rotation.log 2>&1

EOF

    # Replace placeholder with actual project root
    sed -i "s|AQUASTREAM_PROJECT_ROOT|$PROJECT_ROOT|g" "$cron_file"
    
    return 0
}

# Install cron jobs
install_cron_jobs() {
    local cron_file="/tmp/aquastream_rotation_cron"
    
    # Get current crontab (if any)
    local current_cron="/tmp/current_cron"
    crontab -l > "$current_cron" 2>/dev/null || touch "$current_cron"
    
    # Remove existing AquaStream entries
    grep -v "AquaStream\|aquastream-rotation\|secrets-rotation.sh" "$current_cron" > "/tmp/filtered_cron" || touch "/tmp/filtered_cron"
    
    # Combine filtered cron with new entries
    cat "/tmp/filtered_cron" "$cron_file" > "/tmp/new_cron"
    
    # Install new crontab
    if crontab "/tmp/new_cron"; then
        log_success "Cron jobs installed successfully"
        
        # Create log file with proper permissions
        sudo touch /var/log/aquastream-rotation.log
        sudo chmod 644 /var/log/aquastream-rotation.log
        sudo chown $(whoami):$(id -gn) /var/log/aquastream-rotation.log 2>/dev/null || true
        
        log_info "Log file created: /var/log/aquastream-rotation.log"
    else
        log_error "Failed to install cron jobs"
        return 1
    fi
    
    # Cleanup temp files
    rm -f "$cron_file" "$current_cron" "/tmp/filtered_cron" "/tmp/new_cron"
}

# Remove cron jobs
remove_cron_jobs() {
    local current_cron="/tmp/current_cron"
    crontab -l > "$current_cron" 2>/dev/null || touch "$current_cron"
    
    # Remove AquaStream entries
    if grep -v "AquaStream\|aquastream-rotation\|secrets-rotation.sh" "$current_cron" > "/tmp/filtered_cron"; then
        if crontab "/tmp/filtered_cron"; then
            log_success "AquaStream cron jobs removed successfully"
        else
            log_error "Failed to remove cron jobs"
            return 1
        fi
    else
        log_info "No AquaStream cron jobs found to remove"
    fi
    
    # Cleanup temp files
    rm -f "$current_cron" "/tmp/filtered_cron"
}

# Show current cron jobs
show_cron_jobs() {
    log_info "Current cron jobs for user $(whoami):"
    echo ""
    
    if crontab -l 2>/dev/null | grep -A 10 -B 2 "AquaStream\|secrets-rotation"; then
        echo ""
        log_info "AquaStream rotation jobs are active"
    else
        log_warning "No AquaStream rotation jobs found"
    fi
}

# Test cron job execution
test_cron_execution() {
    log_info "Testing secrets rotation script execution..."
    
    local rotation_script="$SCRIPT_DIR/secrets-rotation.sh"
    
    if [[ ! -f "$rotation_script" ]]; then
        log_error "Secrets rotation script not found: $rotation_script"
        return 1
    fi
    
    if [[ ! -x "$rotation_script" ]]; then
        log_error "Secrets rotation script is not executable: $rotation_script"
        return 1
    fi
    
    # Test status command
    if "$rotation_script" status >/dev/null 2>&1; then
        log_success "Secrets rotation script test passed"
    else
        log_error "Secrets rotation script test failed"
        return 1
    fi
}

# Setup log rotation for rotation logs
setup_log_rotation() {
    local logrotate_config="/etc/logrotate.d/aquastream-rotation"
    
    cat > "/tmp/aquastream-logrotate" << 'EOF'
/var/log/aquastream-rotation.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    postrotate
        # Send HUP signal to rsyslog if running
        /bin/kill -HUP `cat /var/run/rsyslogd.pid 2> /dev/null` 2> /dev/null || true
    endscript
}
EOF

    if sudo cp "/tmp/aquastream-logrotate" "$logrotate_config" 2>/dev/null; then
        log_success "Log rotation configured: $logrotate_config"
    else
        log_warning "Could not setup log rotation (requires sudo). Manual setup may be needed."
    fi
    
    rm -f "/tmp/aquastream-logrotate"
}

# Show usage
show_usage() {
    cat << EOF
AquaStream Secrets Rotation Cron Setup

Usage:
    $0 [COMMAND]

Commands:
    install                     Install cron jobs for automated rotation
    remove                      Remove all AquaStream cron jobs
    show                        Show current cron jobs
    test                        Test rotation script execution
    setup-logrotate            Setup log rotation for rotation logs
    help                        Show this help message

Cron Schedule:
    Weekly Rotation:           Sundays at 2:00 AM
    Daily Status Check:        Every day at 6:00 AM  
    Monthly Cleanup:           1st day of month at 3:00 AM
    Service Verification:      Sundays at 2:30 AM

Examples:
    $0 install                  # Install automated rotation
    $0 show                     # Check current jobs
    $0 remove                   # Remove automation
    $0 test                     # Test script functionality

Notes:
    - Logs are written to /var/log/aquastream-rotation.log
    - Requires cron daemon to be running
    - Manual rotation can be done with secrets-rotation.sh
    - Use 'crontab -e' for custom schedule modifications

EOF
}

# Main execution
main() {
    local command="${1:-help}"
    
    case "$command" in
        "install")
            log_info "Installing AquaStream secrets rotation cron jobs..."
            check_cron_availability
            test_cron_execution
            create_cron_entries
            install_cron_jobs
            setup_log_rotation
            log_success "Automated secrets rotation setup completed!"
            echo ""
            log_info "Next steps:"
            echo "  1. Verify cron service is running: systemctl status cron"
            echo "  2. Check logs: tail -f /var/log/aquastream-rotation.log"
            echo "  3. Manual test: $SCRIPT_DIR/secrets-rotation.sh status"
            ;;
        "remove")
            log_info "Removing AquaStream secrets rotation cron jobs..."
            remove_cron_jobs
            ;;
        "show")
            show_cron_jobs
            ;;
        "test")
            check_cron_availability
            test_cron_execution
            ;;
        "setup-logrotate")
            setup_log_rotation
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

# Run main function
main "$@"