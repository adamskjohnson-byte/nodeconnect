-- Additive one-time welcome-email state for accounts registered after deployment.
-- Existing users remain ineligible because welcome_email_eligible_at stays NULL.
-- Apply once after migrations 001-004 and before deploying code that writes
-- welcome_email_eligible_at; this migration sends no email or backfill.

USE nodeconnect;

ALTER TABLE users
    ADD COLUMN welcome_email_eligible_at DATETIME NULL DEFAULT NULL,
    ADD COLUMN welcome_email_claimed_at DATETIME NULL DEFAULT NULL,
    ADD COLUMN welcome_email_sent_at DATETIME NULL DEFAULT NULL;
