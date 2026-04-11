// Configuración global de Supabase
const url = 'https://ewudvqruvxrneigvawtj.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dWR2cXJ1dnhybmVpZ3Zhd3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODEzMjAsImV4cCI6MjA5MTM1NzMyMH0.Xj1bp29bUCrkcisdJyKppGNxIaRN4lXFA5WsULh37Us';

window.sbClient = supabase.createClient(url, key);
