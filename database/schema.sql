-- =============================================================
--  SoyR1App – PostgreSQL Database Schema
--  Entities: Users, Exams, Questions, Results
--             Sessions, Password Reset Tokens, Permissions
-- =============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,          -- store bcrypt / argon2 hash, never plaintext
    role          VARCHAR(20)  NOT NULL DEFAULT 'student'   -- 'student' | 'admin'
                  CHECK (role IN ('student', 'admin')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. EXAMS
-- ============================================================
CREATE TABLE exams (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    call_name       VARCHAR(100),               -- e.g. "ENURM 2024"  (was: convocatoria)
    year            SMALLINT,                   -- edition year       (was: anualidad)
    category        VARCHAR(150),               -- broad grouping
    subject         VARCHAR(150),               -- subject / specialty (was: asignatura)
    difficulty      VARCHAR(10)  NOT NULL DEFAULT 'medium'
                    CHECK (difficulty IN ('easy', 'medium', 'hard')),
    duration_mins   SMALLINT     NOT NULL DEFAULT 90,   -- allowed time in minutes
    is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. QUESTIONS
-- ============================================================
CREATE TABLE questions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID         NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    number          SMALLINT,                        -- question order within the exam  (was: numero)
    body            TEXT         NOT NULL,           -- question stem / text            (was: enunciado)
    image_name      TEXT,                            -- image filename or base64 ref    (was: imagen_nombre)
    option1         TEXT         NOT NULL,           -- (was: opcion1)
    option2         TEXT         NOT NULL,           -- (was: opcion2)
    option3         TEXT         NOT NULL,           -- (was: opcion3)
    option4         TEXT         NOT NULL,           -- (was: opcion4)
    option5         TEXT,                            -- optional 5th option             (was: opcion5)
    correct_option  SMALLINT     NOT NULL            -- 1-based index of correct option (was: correcta)
                    CHECK (correct_option BETWEEN 1 AND 5),
    explanation     TEXT,                            -- explanation / rationale          (was: comentario)
    subject         VARCHAR(150),                    -- may differ from exam-level       (was: asignatura)
    topic           VARCHAR(255),                    -- topic                            (was: tema)
    subtopic        VARCHAR(255),                    -- sub-topic                        (was: subtema)
    difficulty      SMALLINT     NOT NULL DEFAULT 2  -- 1=easy 2=medium 3=hard          (was: dificultad)
                    CHECK (difficulty BETWEEN 1 AND 3),
    has_video       BOOLEAN      NOT NULL DEFAULT FALSE,  -- (was: tiene_video)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. RESULTS  (one row per exam attempt)
-- ============================================================
CREATE TABLE results (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id             UUID         NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    started_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    time_spent_secs     INT,                          -- total seconds the user spent
    total_questions     SMALLINT     NOT NULL,
    correct_answers     SMALLINT     NOT NULL DEFAULT 0,
    incorrect_answers   SMALLINT     NOT NULL DEFAULT 0,
    unanswered          SMALLINT     NOT NULL DEFAULT 0,
    score               NUMERIC(5,2) NOT NULL DEFAULT 0,   -- raw score
    percentage          NUMERIC(5,2) NOT NULL DEFAULT 0,   -- 0.00 – 100.00
    is_completed        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. RESULT_ANSWERS  (one row per question per attempt)
--    Detail table that stores the selected answer for each question
-- ============================================================
CREATE TABLE result_answers (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id            UUID        NOT NULL REFERENCES results(id) ON DELETE CASCADE,
    question_id          UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer      SMALLINT,                    -- 1-based index; NULL = unanswered
    is_correct           BOOLEAN,                     -- computed at submission time
    is_marked_for_review BOOLEAN     NOT NULL DEFAULT FALSE,
    time_spent_secs      INT         NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (result_id, question_id)                   -- one answer per question per attempt
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Users
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Exams
CREATE INDEX idx_exams_year       ON exams(year);
CREATE INDEX idx_exams_difficulty ON exams(difficulty);
CREATE INDEX idx_exams_subject    ON exams(subject);

-- Questions
CREATE INDEX idx_questions_exam_id    ON questions(exam_id);
CREATE INDEX idx_questions_subject    ON questions(subject);
CREATE INDEX idx_questions_topic      ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Results
CREATE INDEX idx_results_user_id   ON results(user_id);
CREATE INDEX idx_results_exam_id   ON results(exam_id);
CREATE INDEX idx_results_completed ON results(completed_at);

-- Result Answers
CREATE INDEX idx_result_answers_result_id   ON result_answers(result_id);
CREATE INDEX idx_result_answers_question_id ON result_answers(question_id);

-- ============================================================
-- AUTO-UPDATE updated_at  (helper trigger function)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. SESSIONS
--    Stores active login sessions / refresh tokens.
--    Works with both JWT refresh-token rotation and
--    server-side session strategies.
-- ============================================================
CREATE TABLE sessions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT         NOT NULL UNIQUE,   -- hash of the refresh / session token
    ip_address      INET,                           -- client IP at login time
    user_agent      TEXT,                           -- browser / device info
    is_revoked      BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMPTZ  NOT NULL,          -- when this session automatically expires
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()  -- updated on each token refresh
);

-- ============================================================
-- 7. PASSWORD_RESET_TOKENS
--    One-time tokens sent via email for password recovery.
-- ============================================================
CREATE TABLE password_reset_tokens (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT         NOT NULL UNIQUE,   -- hash of the emailed token
    is_used     BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ  NOT NULL,          -- short-lived (e.g. 1 hour)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. PERMISSIONS
--    Fine-grained permission flags that can be assigned
--    to individual users (supplements the coarse role column).
-- ============================================================
CREATE TABLE permissions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'exam:create', 'question:delete'
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Junction table – which permissions a user has
CREATE TABLE user_permissions (
    user_id        UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id  UUID  NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by     UUID  REFERENCES users(id) ON DELETE SET NULL,  -- admin who granted it
    granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, permission_id)
);

-- ============================================================
-- INDEXES – Auth tables
-- ============================================================

-- Sessions
CREATE INDEX idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);   -- for cleanup jobs

-- Password reset tokens
CREATE INDEX idx_prt_user_id    ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_prt_expires_at ON password_reset_tokens(expires_at);

-- User permissions
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
