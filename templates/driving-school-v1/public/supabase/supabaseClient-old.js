import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// First Step Driving School - Supabase Configuration
const SUPABASE_URL = 'https://drrrexovkxbhevwsueck.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycnJleG92a3hiaGV2d3N1ZWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODQwMTAsImV4cCI6MjA4Mjk2MDAxMH0.kaYOnK-lulidzJA0OVbvQ8pC82AQgsifjqDipIQ-Wlw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper function to insert a lead
export async function insertLead(leadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      first_name: leadData.firstName,
      last_name: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      interest: leadData.interest || leadData.subject,
      message: leadData.message,
      source: leadData.source || 'firststepdriving.com',
      page: leadData.page || 'unknown'
    }])
  
  if (error) {
    console.error('Error inserting lead:', error)
    throw error
  }
  
  return data
}
