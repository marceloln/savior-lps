import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vaoolcqccxvxvacyepen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhb29sY3FjY3h2eHZhY3llcGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzgzMDIsImV4cCI6MjA4OTk1NDMwMn0.WqhP0xtNQ_nwgP_V6mwa1cGV-ooP1tXuITWYmCjdHto';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
