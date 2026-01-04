import psycopg2
urls = [
    "postgresql://postgres:%40Harshit%40123@db.unbgqtdjrrcoohyzdfex.supabase.co:5432/postgres?sslmode=require",
    "postgresql://postgres:Harshit%40123@db.unbgqtdjrrcoohyzdfex.supabase.co:5432/postgres?sslmode=require"
]
for url in urls:
    print(f"Testing: {url.replace('%40', '@')}")
    try:
        conn = psycopg2.connect(url, connect_timeout=5)
        print("Connection successful!")
        conn.close()
        break
    except Exception as e:
        print(f"Connection failed: {e}")
