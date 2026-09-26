-- ============================================================
-- NodeConnect Database Schema
-- Authentication foundation
-- ============================================================

CREATE DATABASE IF NOT EXISTS nodeconnect
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE nodeconnect;

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    email_verified_at DATETIME NULL,

    status ENUM('active', 'suspended', 'disabled')
        NOT NULL DEFAULT 'active',

    role ENUM('user', 'admin')
        NOT NULL DEFAULT 'user',

    last_login_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_users_email (email),

    INDEX idx_users_status (status),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- AUTH SESSIONS
-- Stores server-side login sessions.
-- The actual session token should be hashed before storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    session_token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_auth_sessions_token_hash (session_token_hash),

    INDEX idx_auth_sessions_user_id (user_id),
    INDEX idx_auth_sessions_expires_at (expires_at),

    CONSTRAINT fk_auth_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- PASSWORD RESET TOKENS
-- Prepared for future "Forgot Password" functionality.
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_password_reset_token_hash (token_hash),

    INDEX idx_password_reset_user_id (user_id),
    INDEX idx_password_reset_expires_at (expires_at),

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- OPTIONAL AUTH ACTIVITY LOG
-- Useful later for security/account activity.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_activity (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_id BIGINT UNSIGNED NULL,

    event_type VARCHAR(50) NOT NULL,

    ip_address VARCHAR(45) NULL,

    user_agent VARCHAR(500) NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_auth_activity_user_id (user_id),
    INDEX idx_auth_activity_event_type (event_type),
    INDEX idx_auth_activity_created_at (created_at),

    CONSTRAINT fk_auth_activity_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
