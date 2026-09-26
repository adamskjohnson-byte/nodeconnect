-- NodeConnect admin visitor monitoring migration
-- Run once against the existing `nodeconnect` database.

USE nodeconnect;

ALTER TABLE users
    ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER status,
    ADD INDEX idx_users_role (role);

CREATE TABLE admin_activity (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    country VARCHAR(100) NULL,
    country_code VARCHAR(10) NULL,
    region VARCHAR(150) NULL,
    city VARCHAR(150) NULL,
    timezone VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    device_type VARCHAR(30) NULL,
    browser VARCHAR(100) NULL,
    operating_system VARCHAR(100) NULL,
    page_path VARCHAR(255) NULL,
    referrer TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_admin_activity_event_type (event_type),
    INDEX idx_admin_activity_created_at (created_at),
    INDEX idx_admin_activity_country_code (country_code),
    INDEX idx_admin_activity_dedup (event_type, ip_address, created_at)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- After reviewing the account, promote the intended administrator manually:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
