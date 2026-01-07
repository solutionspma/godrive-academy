#!/usr/bin/env python3

import subprocess
import json
import sys

def run_command(cmd):
    """Run a shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(f"stderr: {e.stderr}")
        return None

def get_access_token():
    """Get Supabase CLI access token"""
    # Try to extract from CLI session
    token_cmd = "supabase --version 2>&1"  # Just verify CLI works
    if run_command(token_cmd):
        print("✅ Supabase CLI is accessible")
        return True
    return False

def configure_via_sql():
    """Configure auth settings via SQL"""
    print("🔧 Configuring Supabase authentication via SQL...")
    
    # Get service role key
    key_output = run_command("supabase projects api-keys --project-ref drrrexovkxbhevwsueck")
    if not key_output:
        print("❌ Failed to get API keys")
        return False
    
    # Extract service_role key
    for line in key_output.split('\n'):
        if 'service_role' in line:
            parts = line.split('|')
            if len(parts) >= 2:
                service_key = parts[1].strip()
                print(f"✅ Got service role key (first 20 chars): {service_key[:20]}...")
                break
    
    # Create SQL to update auth settings
    sql_commands = """
-- Enable email confirmations
ALTER SYSTEM SET app.jwt_secret TO 'your-jwt-secret';

-- These settings are managed in Supabase Dashboard
-- Please visit: https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/settings/auth
-- And configure:
-- 1. Site URL: https://godrive-academy.netlify.app
-- 2. Additional Redirect URLs:
--    - https://godrive-academy.netlify.app/demo/coach.html
--    - https://godrive-academy.netlify.app/demo/dashboard.html
-- 3. Email Auth Settings:
--    - Enable email confirmations: ON
--    - Confirm email: ON
"""
    
    print("\n📋 SQL Configuration Notes:")
    print(sql_commands)
    return True

def main():
    print("=" * 60)
    print("🚀 Supabase Auth Configuration Script")
    print("=" * 60)
    print("")
    
    # Check CLI
    if not get_access_token():
        print("❌ Supabase CLI not properly configured")
        sys.exit(1)
    
    # Try SQL approach
    configure_via_sql()
    
    print("\n" + "=" * 60)
    print("📖 MANUAL CONFIGURATION REQUIRED")
    print("=" * 60)
    print("")
    print("Visit the Supabase Dashboard and configure:")
    print("")
    print("🔗 Auth Settings:")
    print("https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/settings/auth")
    print("")
    print("Required Changes:")
    print("1. Site URL: https://godrive-academy.netlify.app")
    print("2. Redirect URLs (one per line):")
    print("   https://godrive-academy.netlify.app/demo/coach.html")
    print("   https://godrive-academy.netlify.app/demo/dashboard.html")
    print("")
    print("🔗 Email Configuration:")
    print("https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/auth/templates")
    print("")
    print("Required Changes:")
    print("1. Enable 'Confirm email' in Email Templates")
    print("2. Set confirmation redirect to:")
    print("   https://godrive-academy.netlify.app/demo/coach.html")
    print("")
    print("=" * 60)
    print("✅ Configuration guide complete")
    print("=" * 60)

if __name__ == "__main__":
    main()
