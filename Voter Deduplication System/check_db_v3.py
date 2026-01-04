import psycopg2
try:
    conn = psycopg2.connect(
        host="db.unbgqtdjrrcoohyzdfex.supabase.co",
        port=5432,
        user="postgres",
        password="@Harshit@123",
        database="postgres",
        sslmode="require",
        connect_timeout=10
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
