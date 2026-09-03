-- Initial Migration based on DATABASE_SCHEMA.md
-- Enables pgcrypto/uuid-ossp for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- USER & PROFILE
-- ==========================================

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phone" VARCHAR(20) UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMPTZ,
    "phone_verified_at" TIMESTAMPTZ,
    "age_declared_18plus" BOOLEAN NOT NULL DEFAULT FALSE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "user_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "gender" VARCHAR(20),
    "religion" VARCHAR(50),
    "religion_consent_at" TIMESTAMPTZ,
    "domicile_province" VARCHAR(100),
    "domicile_city" VARCHAR(100),
    "domicile_lat" DECIMAL(9,6),
    "domicile_lng" DECIMAL(9,6),
    "domicile_verified_at" TIMESTAMPTZ,
    "education" VARCHAR(100),
    "occupation" VARCHAR(100),
    "data_share_consent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "user_profiles_user_id_key" UNIQUE("user_id")
);

-- ==========================================
-- RESEARCH
-- ==========================================

CREATE TABLE "researches" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "researcher_id" UUID NOT NULL REFERENCES "users"("id"),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "external_survey_url" TEXT NOT NULL,
    "target_respondent_count" INT NOT NULL CHECK ("target_respondent_count" >= 50),
    "estimated_duration_minutes" INT NOT NULL,
    "deadline" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "tokens_reserved" INT NOT NULL DEFAULT 0,
    "tokens_consumed" INT NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "research_criteria" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "research_id" UUID NOT NULL REFERENCES "researches"("id") ON DELETE CASCADE,
    "field" VARCHAR(50) NOT NULL,
    "operator" VARCHAR(20) NOT NULL,
    "value" TEXT NOT NULL
);

CREATE TABLE "screening_questions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "research_id" UUID NOT NULL REFERENCES "researches"("id") ON DELETE CASCADE,
    "question_text" TEXT NOT NULL,
    "scoring_weight" INT NOT NULL DEFAULT 1,
    "pass_threshold" INT NOT NULL
);

-- ==========================================
-- PARTICIPATION
-- ==========================================

CREATE TABLE "respondent_participations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "research_id" UUID NOT NULL REFERENCES "researches"("id"),
    "respondent_id" UUID NOT NULL REFERENCES "users"("id"),
    "status" VARCHAR(30) NOT NULL DEFAULT 'invited',
    "screening_score" INT,
    "submitted_at" TIMESTAMPTZ,
    "auto_screening_result" VARCHAR(20),
    "admin_reviewed_by" UUID REFERENCES "users"("id"),
    "admin_reviewed_at" TIMESTAMPTZ,
    "hold_release_at" TIMESTAMPTZ,
    "rewarded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "respondent_participations_research_respondent_key" UNIQUE("research_id", "respondent_id")
);

CREATE TABLE "screening_answers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "participation_id" UUID NOT NULL REFERENCES "respondent_participations"("id") ON DELETE CASCADE,
    "screening_question_id" UUID NOT NULL REFERENCES "screening_questions"("id"),
    "answer" TEXT NOT NULL,
    "score" INT NOT NULL
);

-- ==========================================
-- TOKEN & LEDGER (APPEND-ONLY)
-- ==========================================

CREATE TABLE "token_wallets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    CONSTRAINT "token_wallets_user_id_key" UNIQUE("user_id")
);

CREATE TABLE "token_transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "wallet_id" UUID NOT NULL REFERENCES "token_wallets"("id"),
    "research_id" UUID REFERENCES "researches"("id"),
    "participation_id" UUID REFERENCES "respondent_participations"("id"),
    "type" VARCHAR(20) NOT NULL,
    "amount" INT NOT NULL,
    "idempotency_key" VARCHAR(255) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "idx_token_tx_wallet" ON "token_transactions"("wallet_id");

-- ==========================================
-- REWARD & WITHDRAWAL
-- ==========================================

CREATE TABLE "rewards" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "participation_id" UUID NOT NULL UNIQUE REFERENCES "respondent_participations"("id"),
    "respondent_token_amount" DECIMAL(4,1) NOT NULL DEFAULT 0.8,
    "platform_token_amount" DECIMAL(4,1) NOT NULL DEFAULT 0.2,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "withdrawals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "token_amount" INT NOT NULL,
    "fee_percentage" DECIMAL(4,2) NOT NULL DEFAULT 3.00,
    "net_amount_idr" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'requested',
    "approved_by" UUID REFERENCES "users"("id"),
    "payment_provider_ref" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "processed_at" TIMESTAMPTZ
);

CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "type" VARCHAR(20) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_ref" VARCHAR(255) UNIQUE,
    "amount_idr" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "idempotency_key" VARCHAR(255) UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- QUALITY & REPUTATION
-- ==========================================

CREATE TABLE "quality_checks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "participation_id" UUID NOT NULL REFERENCES "respondent_participations"("id"),
    "signal_flags" JSONB,
    "auto_score" DECIMAL(5,2),
    "reviewed_by" UUID REFERENCES "users"("id"),
    "decision" VARCHAR(20),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "quality_scores" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id"),
    "score" DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    "consecutive_good_answers" INT NOT NULL DEFAULT 0,
    "throttled" BOOLEAN NOT NULL DEFAULT FALSE,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- CONTENT MODERATION & SUPPORT
-- ==========================================

CREATE TABLE "content_reports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "research_id" UUID NOT NULL REFERENCES "researches"("id"),
    "reported_by" UUID REFERENCES "users"("id"),
    "reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "reviewed_by" UUID REFERENCES "users"("id"),
    "action_taken" VARCHAR(30),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "support_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "category" VARCHAR(30) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "assigned_to" UUID REFERENCES "users"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "resolved_at" TIMESTAMPTZ
);

-- ==========================================
-- ADMIN & NOTIFICATION
-- ==========================================

CREATE TABLE "admin_reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL REFERENCES "users"("id"),
    "admin_role" VARCHAR(20) NOT NULL,
    "target_type" VARCHAR(30) NOT NULL,
    "target_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id"),
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
