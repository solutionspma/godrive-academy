#!/bin/bash

echo "🔧 Configuring Supabase Authentication..."
echo ""
echo "Project: drrrexovkxbhevwsueck"
echo "Site URL: https://godrive-academy.netlify.app"
echo ""
echo "Opening Supabase Dashboard to configure auth settings..."
echo ""
echo "Please make the following changes manually:"
echo ""
echo "1. Site URL: https://godrive-academy.netlify.app"
echo "2. Redirect URLs:"
echo "   - https://godrive-academy.netlify.app/demo/coach.html"
echo "   - https://godrive-academy.netlify.app/demo/dashboard.html"
echo "3. Enable Email Confirmations: ON"
echo "4. Email Template (Confirm signup):"
echo "   Redirect URL: https://godrive-academy.netlify.app/demo/coach.html"
echo ""

open "https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/settings/auth"
sleep 2
open "https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/auth/url-configuration"
sleep 2
open "https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/auth/templates"

echo ""
echo "✅ Browser windows opened. Please complete the configuration manually."
