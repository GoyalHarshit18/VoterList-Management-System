import psycopg2
try:
    conn = psycopg2.connect("postgresql://postgres:%40Harshit%40123@db.unbgqtdjrrcoohyzdfex.supabase.co:5432/postgres?sslmode=require", connect_timeout=5)
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
