-- NodeConnect account settings and security migration.
-- Apply once manually to the existing nodeconnect database after migration 001.
-- This migration does not rewrite existing users or authentication data.

USE nodeconnect;

CREATE TABLE user_preferences (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    theme ENUM('dark', 'light', 'system') NOT NULL DEFAULT 'dark',
    sound_enabled TINYINT(1) NOT NULL DEFAULT 1,
    sound_volume TINYINT UNSIGNED NOT NULL DEFAULT 70,
    activity_notifications TINYINT(1) NOT NULL DEFAULT 1,
    staking_notifications TINYINT(1) NOT NULL DEFAULT 1,
    reward_notifications TINYINT(1) NOT NULL DEFAULT 1,
    referral_notifications TINYINT(1) NOT NULL DEFAULT 1,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_preferences_user_id (user_id),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_verification_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email_verification_token_hash (token_hash),
    INDEX idx_email_verification_user (user_id),
    INDEX idx_email_verification_expiry (expires_at),
    CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_two_factor (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    secret_encrypted TEXT NOT NULL,
    enabled_at DATETIME NULL,
    last_used_at DATETIME NULL,
    last_totp_timestamp BIGINT UNSIGNED NULL,
    setup_expires_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_two_factor_user_id (user_id),
    CONSTRAINT fk_user_two_factor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_recovery_codes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    code_hash CHAR(64) NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_recovery_code_hash (code_hash),
    INDEX idx_user_recovery_codes_user (user_id),
    CONSTRAINT fk_user_recovery_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_login_challenges (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    challenge_token_hash CHAR(64) NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auth_login_challenge_hash (challenge_token_hash),
    INDEX idx_auth_login_challenge_user (user_id),
    INDEX idx_auth_login_challenge_expiry (expires_at),
    CONSTRAINT fk_auth_login_challenge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE security_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(60) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_security_events_user_created (user_id, created_at),
    INDEX idx_security_events_type_created (event_type, created_at),
    CONSTRAINT fk_security_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE security_rate_limits (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    action VARCHAR(40) NOT NULL,
    scope_hash CHAR(64) NOT NULL,
    attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    window_started_at DATETIME NOT NULL,
    blocked_until DATETIME NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_security_rate_limit_scope (action, scope_hash),
    INDEX idx_security_rate_limit_blocked (blocked_until)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE auth_sessions
    ADD COLUMN ip_address VARCHAR(45) NULL,
    ADD COLUMN user_agent VARCHAR(500) NULL,
    ADD COLUMN device_type VARCHAR(30) NULL,
    ADD COLUMN browser VARCHAR(100) NULL,
    ADD COLUMN operating_system VARCHAR(100) NULL;

ALTER TABLE users
    ADD COLUMN deactivated_at DATETIME NULL;
