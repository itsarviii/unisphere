import time

from django.db import connection


def wait_for_db(max_retries=10, delay=3):
    for _ in range(max_retries):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
            return True
        except Exception:
            time.sleep(delay)
    return False


def is_database_available():
    # Query a real table (not just SELECT 1) so Supabase compute stays active.
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM users_user;")
        return True
    except Exception:
        return False
