#!/bin/bash

echo "📊 Applying seed data to Supabase database..."
echo ""

PROJECT_REF="drrrexovkxbhevwsueck"

# Get the database connection string
echo "Getting connection details..."

# Use Supabase CLI to execute the seed SQL
echo "Executing seed.sql..."

# Try using supabase db execute (if available)
if supabase db execute --linked --file supabase/seed.sql 2>&1 | grep -q "error"; then
  echo "⚠️  CLI method failed. Trying alternative..."
  
  # Alternative: Use psql directly
  echo ""
  echo "📝 Manual seed data application required"
  echo ""
  echo "Visit Supabase SQL Editor:"
  echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  echo ""
  echo "Copy and paste the contents of: supabase/seed.sql"
  echo ""
  
  open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  
  echo "✅ SQL Editor opened. Please paste and run the seed.sql contents."
else
  echo "✅ Seed data applied successfully!"
fi

echo ""
echo "Seed data includes:"
echo "- 10 California DMV practice questions"
echo "- 5 Texas DMV practice questions"
echo "- Tables: profiles, practice_sessions, questions"
echo "- Row Level Security policies"
echo "- Auto-profile creation trigger"
