#!/usr/bin/env python3
"""
migrate_enurm.py
================
Migrates questions from an ENURM JSON export into the SoyR1App PostgreSQL
database.  The script:

  1. Reads the JSON file (array of question objects).
  2. Derives a single Exam record from the shared metadata
     (Convocatoria / Anualidad / Asignatura) found in the questions.
  3. Upserts the Exam row (matched on call_name + year).
  4. For each question, upserts a Questions row using the source
     PreguntaId as the primary key (UUID is preserved).

Usage
-----
  python migrate_enurm.py [OPTIONS]

Options
-------
  --json    PATH   Path to the JSON file  (default: src/data/ENURM EXAMS/ENURM-2007.json)
  --dsn     STR    PostgreSQL DSN         (default: reads env var DATABASE_URL)
  --dry-run        Parse & validate without writing to the DB

Requirements
------------
  pip install psycopg2-binary python-dotenv
"""

import argparse
import json
import os
import sys
import uuid
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional: load .env file if present next to this script or at project root
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.exists():
        load_dotenv(_env)
    else:
        load_dotenv()          # fallback: cwd .env
except ImportError:
    pass  # python-dotenv not installed; rely on real env vars

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    sys.exit(
        "psycopg2 is not installed.  Run:  pip install psycopg2-binary"
    )

# ---------------------------------------------------------------------------
# Difficulty mapping: JSON integer (1-3) → schema 'easy'|'medium'|'hard'
# ---------------------------------------------------------------------------
DIFFICULTY_EXAM_MAP = {1: "easy", 2: "medium", 3: "hard"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_args():
    base_dir = Path(__file__).resolve().parent.parent
    default_json = str(
        base_dir / "src" / "data" / "ENURM EXAMS" / "ENURM-2007.json"
    )

    p = argparse.ArgumentParser(
        description="Migrate ENURM JSON questions into PostgreSQL."
    )
    p.add_argument(
        "--json",
        dest="json_path",
        default=default_json,
        help="Path to the ENURM JSON file.",
    )
    p.add_argument(
        "--dsn",
        dest="dsn",
        default=os.getenv("DATABASE_URL", ""),
        help="PostgreSQL DSN (or set DATABASE_URL env var).",
    )
    p.add_argument(
        "--dry-run",
        dest="dry_run",
        action="store_true",
        help="Parse & validate without touching the database.",
    )
    return p.parse_args()


def load_questions(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, list):
        sys.exit(f"Expected a JSON array at the top level in: {path}")
    return data


def derive_exam_meta(questions: list[dict]) -> dict:
    """
    Pull shared metadata from the first question.
    All questions in one JSON file belong to the same exam.
    """
    first = questions[0]
    convocatoria = first.get("Convocatoria") or ""
    anualidad = first.get("Anualidad")
    asignatura = first.get("Asignatura") or ""

    # Map numeric difficulty → exam difficulty string (use median / mode)
    diffs = [q.get("Dificultad", 2) for q in questions if q.get("Dificultad")]
    avg_diff = round(sum(diffs) / len(diffs)) if diffs else 2
    exam_difficulty = DIFFICULTY_EXAM_MAP.get(avg_diff, "medium")

    return {
        "title": convocatoria,          # e.g. "ENURM 2007"
        "call_name": convocatoria,      # e.g. "ENURM 2007"
        "year": anualidad,              # e.g. 2007
        "subject": asignatura,          # may be empty / varied; first q used
        "difficulty": exam_difficulty,
        "description": None,
        "is_published": False,
    }


# ---------------------------------------------------------------------------
# DB operations
# ---------------------------------------------------------------------------

UPSERT_EXAM = """
INSERT INTO exams (title, call_name, year, subject, difficulty,
                   description, is_published)
VALUES (%(title)s, %(call_name)s, %(year)s, %(subject)s, %(difficulty)s,
        %(description)s, %(is_published)s)
ON CONFLICT (call_name, year)            -- requires a UNIQUE constraint (see note)
DO UPDATE SET
    title        = EXCLUDED.title,
    subject      = EXCLUDED.subject,
    difficulty   = EXCLUDED.difficulty,
    description  = COALESCE(EXCLUDED.description, exams.description),
    updated_at   = NOW()
RETURNING id;
"""

# NOTE: the ON CONFLICT clause above requires a unique constraint on (call_name, year).
# If your schema doesn't have it yet, the script will add it automatically (see below).

ADD_EXAM_UNIQUE_CONSTRAINT = """
ALTER TABLE exams
    ADD CONSTRAINT uq_exams_call_name_year UNIQUE (call_name, year);
"""

CHECK_EXAM_CONSTRAINT = """
SELECT 1
FROM   information_schema.table_constraints
WHERE  table_name       = 'exams'
  AND  constraint_name  = 'uq_exams_call_name_year';
"""

UPSERT_QUESTION = """
INSERT INTO questions (
    id, exam_id, number, body, image_name,
    option1, option2, option3, option4, option5,
    correct_option, explanation,
    subject, topic, subtopic,
    difficulty, has_video
)
VALUES (
    %(id)s, %(exam_id)s, %(number)s, %(body)s, %(image_name)s,
    %(option1)s, %(option2)s, %(option3)s, %(option4)s, %(option5)s,
    %(correct_option)s, %(explanation)s,
    %(subject)s, %(topic)s, %(subtopic)s,
    %(difficulty)s, %(has_video)s
)
ON CONFLICT (id) DO UPDATE SET
    exam_id        = EXCLUDED.exam_id,
    number         = EXCLUDED.number,
    body           = EXCLUDED.body,
    image_name     = EXCLUDED.image_name,
    option1        = EXCLUDED.option1,
    option2        = EXCLUDED.option2,
    option3        = EXCLUDED.option3,
    option4        = EXCLUDED.option4,
    option5        = EXCLUDED.option5,
    correct_option = EXCLUDED.correct_option,
    explanation    = EXCLUDED.explanation,
    subject        = EXCLUDED.subject,
    topic          = EXCLUDED.topic,
    subtopic       = EXCLUDED.subtopic,
    difficulty     = EXCLUDED.difficulty,
    has_video      = EXCLUDED.has_video,
    updated_at     = NOW();
"""


def question_row(q: dict, exam_id: str) -> dict:
    """Map a JSON question object to a DB row dict."""
    raw_diff = q.get("Dificultad", 2)
    # questions.difficulty is SMALLINT 1-3; clamp just in case
    diff = max(1, min(3, int(raw_diff))) if raw_diff is not None else 2

    # Strip potential None before passing option3/4 (schema: NOT NULL)
    def must(val, field):
        if val is None:
            raise ValueError(
                f"Question {q.get('PreguntaId')} – required field '{field}' is NULL."
            )
        return val

    return {
        "id": q["PreguntaId"],
        "exam_id": exam_id,
        "number": q.get("Numero"),
        "body": must(q.get("Enunciado"), "Enunciado"),
        "image_name": q.get("ImagenNombre"),
        "option1": must(q.get("Opcion1"), "Opcion1"),
        "option2": must(q.get("Opcion2"), "Opcion2"),
        "option3": must(q.get("Opcion3"), "Opcion3"),
        "option4": must(q.get("Opcion4"), "Opcion4"),
        "option5": q.get("Opcion5"),             # nullable
        "correct_option": must(q.get("Correcta"), "Correcta"),
        "explanation": q.get("Comentario"),
        "subject": q.get("Asignatura"),
        "topic": q.get("Tema"),
        "subtopic": q.get("Subtema"),
        "difficulty": diff,
        "has_video": bool(q.get("TieneVideo", False)),
    }


def ensure_exam_constraint(cur):
    """Add the UNIQUE constraint on exams(call_name, year) if absent."""
    cur.execute(CHECK_EXAM_CONSTRAINT)
    if not cur.fetchone():
        print("  [info] Adding UNIQUE constraint on exams(call_name, year) …")
        cur.execute(ADD_EXAM_UNIQUE_CONSTRAINT)


def migrate(dsn: str, questions: list[dict], exam_meta: dict, dry_run: bool):
    if dry_run:
        print(f"[dry-run] Would insert 1 exam + {len(questions)} questions.")
        print(f"  Exam: {exam_meta['title']} ({exam_meta['year']})")
        # validate rows
        for q in questions:
            question_row(q, "00000000-0000-0000-0000-000000000000")
        print("[dry-run] All rows validated successfully.")
        return

    if not dsn:
        sys.exit(
            "No database DSN provided.  Use --dsn or set DATABASE_URL env var."
        )

    conn = psycopg2.connect(dsn)
    try:
        with conn:
            with conn.cursor() as cur:
                # 1. Ensure unique constraint exists
                ensure_exam_constraint(cur)

                # 2. Upsert exam row
                cur.execute(UPSERT_EXAM, exam_meta)
                exam_id = cur.fetchone()[0]
                print(f"  [exam] id={exam_id}  title='{exam_meta['title']}'")

                # 3. Upsert each question
                rows = [question_row(q, str(exam_id)) for q in questions]
                psycopg2.extras.execute_batch(cur, UPSERT_QUESTION, rows, page_size=100)
                print(f"  [questions] {len(rows)} rows upserted.")

        print("Migration committed successfully.")
    except Exception as exc:
        conn.rollback()
        raise
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    args = parse_args()

    print(f"Loading JSON from: {args.json_path}")
    questions = load_questions(args.json_path)
    print(f"  {len(questions)} questions found.")

    exam_meta = derive_exam_meta(questions)
    print(f"  Exam metadata: {exam_meta['title']} ({exam_meta['year']})")

    migrate(args.dsn, questions, exam_meta, args.dry_run)


if __name__ == "__main__":
    main()
