// utils/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

// URL + service-role key bypass RLS entirely
export const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) 