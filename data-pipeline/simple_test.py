"""
Simple Supabase connection test
"""
import os
import psycopg2

# Test with direct connection
try:
    print("Testing direct connection...")
    conn = psycopg2.connect(
        host="db.zbgoyzahlllglsljln.supabase.co",
        port=5432,
        user="postgres", 
        password="annu121#daksh",
        dbname="postgres"
    )
    print("✅ Direct connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Direct connection failed: {e}")

# Test with pooler (you need to replace [ref] with actual project ID)
try:
    print("\nTesting pooler connection...")
    conn = psycopg2.connect(
        host="aws-0-us-west-1.pooler.supabase.com",
        port=5432,
        user="postgres.[ref]",  # Replace [ref] with your actual project ID
        password="annu121#daksh",
        dbname="postgres"
    )
    print("✅ Pooler connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Pooler connection failed: {e}")
