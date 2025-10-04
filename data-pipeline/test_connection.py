"""
Test Supabase connection before running the full pipeline.
"""

import os
import socket
from urllib.parse import urlparse

def test_connection():
    """Test Supabase connection."""
    
    # Get connection details
    database_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_URL")
    
    if database_url:
        print(f"Using DATABASE_URL: {database_url[:50]}...")
        try:
            # Handle pooler URLs that might have special characters
            import urllib.parse
            parsed = urllib.parse.urlparse(database_url)
            host = parsed.hostname
            port = parsed.port or 5432
            user = parsed.username
            password = parsed.password
            dbname = parsed.path[1:] if parsed.path else "postgres"
        except Exception as e:
            print(f"❌ Error parsing DATABASE_URL: {e}")
            print("This usually happens when the password contains special characters like #, @, etc.")
            print("Try URL-encoding the password or use individual environment variables instead.")
            return False
    else:
        print("Using individual environment variables")
        host = os.getenv("SUPABASE_HOST")
        port = int(os.getenv("SUPABASE_PORT", "5432"))
        user = os.getenv("SUPABASE_USER")
        password = os.getenv("SUPABASE_PASSWORD")
        dbname = os.getenv("SUPABASE_DB", "postgres")
    
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"User: {user}")
    print(f"Database: {dbname}")
    print(f"Password: {'*' * len(password) if password else 'NOT SET'}")
    
    # Test 1: TCP Connection
    print("\n1. Testing TCP connection...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ TCP connection successful")
        else:
            print(f"❌ TCP connection failed (error code: {result})")
            print("Possible issues:")
            print("- Supabase project is paused/inactive")
            print("- Wrong host/port")
            print("- Firewall blocking connection")
            print("- Network connectivity issues")
            return False
            
    except Exception as e:
        print(f"❌ TCP connection error: {e}")
        return False
    
    # Test 2: PostgreSQL Connection
    print("\n2. Testing PostgreSQL connection...")
    try:
        import psycopg2
        
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=dbname
            )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ PostgreSQL connection successful")
        print(f"Database version: {version[:50]}...")
        
        # Test pgvector extension
        cursor.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
        if cursor.fetchone():
            print("✅ pgvector extension is installed")
        else:
            print("⚠️  pgvector extension not found - you may need to enable it")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your Supabase project settings")
        print("2. Verify the connection string in Supabase dashboard")
        print("3. Make sure your IP is whitelisted")
        print("4. Check if the project is paused")
        return False

if __name__ == "__main__":
    print("🔍 Supabase Connection Test")
    print("=" * 40)
    
    success = test_connection()
    
    if success:
        print("\n🎉 Connection test passed! You can run the pipeline.")
    else:
        print("\n❌ Connection test failed. Fix the issues above before running the pipeline.")
        print("\nTo get your connection details:")
        print("1. Go to your Supabase project dashboard")
        print("2. Settings → Database")
        print("3. Copy the connection string")
        print("4. Set it as DATABASE_URL environment variable")
