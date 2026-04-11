import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Using hardcoded defaults (legacy).');
}

export const supabase = createClient(
  supabaseUrl || 'https://ewudvqruvxrneigvawtj.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dWR2cXJ1dnhybmVpZ3Zhd3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODEzMjAsImV4cCI6MjA5MTM1NzMyMH0.Xj1bp29bUCrkcisdJyKppGNxIaRN4lXFA5WsULh37Us'
);
