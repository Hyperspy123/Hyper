import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sccwxmwguqfzxhhuxwgo.supabase.co';
const supabaseAnonKey = 'sb_publishable_rP8_T-HrKSAjr2Ei8pG41A_98Cf7P7K';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
