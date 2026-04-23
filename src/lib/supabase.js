import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewudvqruvxrneigvawtj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mx7aCWiFpPEr1lbI1tkVMA_pcXahlVz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

