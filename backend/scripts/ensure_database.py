"""Ensure that the target PostgreSQL database exists before migrations run."""

import os
import time

import psycopg2  # type: ignore
from psycopg2 import sql  # type: ignore
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT  # type: ignore


RETRY_COUNT = int(os.getenv("DB_INIT_RETRIES", "10"))
RETRY_DELAY = float(os.getenv("DB_INIT_RETRY_DELAY", "3"))

TARGET_DB = os.getenv("DB_NAME", "bilkent_secret_gifts")
ADMIN_DB = os.getenv("DB_ADMIN_DB", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_ADMIN_USER", os.getenv("DB_USER", "postgres"))
DB_PASSWORD = os.getenv("DB_ADMIN_PASSWORD", os.getenv("DB_PASSWORD", "postgres"))


def ensure_database() -> None:
    """Create the target database if it does not exist."""
    connection = _connect_with_retries()
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (TARGET_DB,),
        )
        exists = cursor.fetchone()

        if exists:
            print(f"[ensure_database] Database '{TARGET_DB}' already exists.")
            return

        print(f"[ensure_database] Creating database '{TARGET_DB}'.")
        cursor.execute(
            sql.SQL("CREATE DATABASE {}").format(sql.Identifier(TARGET_DB))
        )
        print(f"[ensure_database] Database '{TARGET_DB}' created successfully.")

    connection.close()


def _connect_with_retries():
    last_error = None
    for attempt in range(1, RETRY_COUNT + 1):
        try:
            return psycopg2.connect(
                dbname=ADMIN_DB,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT,
            )
        except psycopg2.OperationalError as exc:
            last_error = exc
            print(
                f"[ensure_database] Attempt {attempt}/{RETRY_COUNT} failed: {exc}. "
                f"Retrying in {RETRY_DELAY}s..."
            )
            time.sleep(RETRY_DELAY)

    raise RuntimeError(
        f"Unable to connect to PostgreSQL at {DB_HOST}:{DB_PORT} "
        f"as {DB_USER} to ensure database '{TARGET_DB}'. "
        f"Last error: {last_error}"
    ) from last_error


if __name__ == "__main__":
    ensure_database()

