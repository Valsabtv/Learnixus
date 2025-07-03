// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://utbkeprbzxxbfnwfowyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0YmtlcHJienh4YmZud2Zvd3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTI4MzksImV4cCI6MjA2NTU4ODgzOX0.d_zfgqwIRqQ7nvpllhIc2PpTRT-6_hpTIQxnGXc-YJQ' // Supabase → Project → Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
