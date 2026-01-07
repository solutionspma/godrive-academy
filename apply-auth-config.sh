#!/bin/bash

PROJECT_REF="drrrexovkxbhevwsueck"

echo "🔧 Applying Supabase Auth Configuration..."
echo ""

# Try to apply via supabase CLI with raw SQL
echo "📝 Creating SQL migration for auth settings..."

cat > /tmp/configure_auth.sql << 'SQL'
-- Update auth configuration
UPDATE auth.config
SET
  site_url = 'https://godrive-academy.netlify.app',
  uri_allow_list = 'https://godrive-academy.netlify.app/**'
WHERE id = 1;

-- Enable email confirmations
UPDATE auth.config
SET mailer_autoconfirm = false
WHERE id = 1;
SQL

echo "✅ SQL migration created"
echo ""

# The above SQL might not work as auth.config is typically managed via dashboard/API
# So we'll provide the manual steps

echo "============================================================"
echo "📖 CONFIGURATION STEPS - COMPLETE IN SUPABASE DASHBOARD"
echo "============================================================"
echo ""
echo "Two browser tabs have been/will be opened. Please configure:"
echo ""
echo "TAB 1 - Authentication Settings"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/settings/auth"
echo ""
echo "Required changes:"
echo "  1. Find 'Site URL' field"
echo "  2. Set to: https://godrive-academy.netlify.app"
echo "  3. Find 'Redirect URLs' section"
echo "  4. Add these URLs (one per line):"
echo "     https://godrive-academy.netlify.app/demo/coach.html"
echo "     https://godrive-academy.netlify.app/demo/dashboard.html"
echo "  5. Scroll to 'Enable Email Confirmations'"
echo "  6. Toggle it ON"
echo "  7. Click 'Save' at the bottom"
echo ""
echo "TAB 2 - Email Templates"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
echo ""
echo "Required changes:"
echo "  1. Find 'Confirm signup' template"
echo "  2. Click to edit"
echo "  3. Find the confirmation URL in the template"
echo "  4. Change redirect to: https://godrive-academy.netlify.app/demo/coach.html"
echo "  5. Click 'Save'"
echo ""
echo "============================================================"
echo ""

# Open the dashboard pages
open "https://supabase.com/dashboard/project/$PROJECT_REF/settings/auth"
sleep 2
open "https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"

echo "✅ Dashboard tabs opened. Complete the configuration above."
echo ""
