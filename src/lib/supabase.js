// src/lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://pvyddkpofjhzqhyfgxpa.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eWRka3BvZmpoenFoeWZneHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDk2NzAsImV4cCI6MjA4OTE4NTY3MH0.LzIM7_Gomsr1OBovbXOHVdHVeosxy3YIFuXV817Wi_U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
