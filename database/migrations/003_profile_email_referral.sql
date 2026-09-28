-- Additive account profile, verified email-change, and referral storage.
-- Safe to apply repeatedly; no existing user or security data is rewritten.

USE nodeconnect;

CREATE TABLE IF NOT EXISTS user_referrals (
    user_id BIGINT UNSIGNED NOT NULL,
    referral_id VARCHAR(24) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_referrals_referral_id (referral_id),
    CONSTRAINT fk_user_referrals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profile_images (
    user_id BIGINT UNSIGNED NOT NULL,
    mime_type ENUM('image/jpeg', 'image/png', 'image/webp') NOT NULL,
    image_data MEDIUMBLOB NOT NULL,
    byte_size INT UNSIGNED NOT NULL,
    width SMALLINT UNSIGNED NOT NULL,
    height SMALLINT UNSIGNED NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_user_profile_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_change_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    new_email VARCHAR(255) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email_change_user (user_id),
    UNIQUE KEY uq_email_change_token_hash (token_hash),
    INDEX idx_email_change_new_email (new_email),
    INDEX idx_email_change_expiry (expires_at),
    CONSTRAINT fk_email_change_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;