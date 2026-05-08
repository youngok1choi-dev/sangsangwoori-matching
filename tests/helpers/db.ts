import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/** matches → seniors → jobs 순으로 전체 삭제 (FK 순서 준수) */
export async function resetDB() {
  await db.from('matches').delete().not('id', 'is', null);
  await db.from('seniors').delete().not('id', 'is', null);
  await db.from('jobs').delete().not('id', 'is', null);
}
