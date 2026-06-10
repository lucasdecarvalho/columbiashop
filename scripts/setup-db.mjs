/**
 * Script para aplicar schema e seed no Supabase.
 * Uso: node scripts/setup-db.mjs
 * Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://goxkxxsvauiymkwkhrsi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdveGt4eHN2YXVpeW1rd2tocnNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA2NDkzMywiZXhwIjoyMDk2NjQwOTMzfQ.Qc_uXEwSuLyC63Tbl5GjcwDW0_j8DzIn7mp1WzEC4iw';

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    // Try management API approach
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/goxkxxsvauiymkwkhrsi/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!mgmtRes.ok) {
      const text = await mgmtRes.text();
      throw new Error(`SQL failed: ${text}`);
    }
    return mgmtRes.json();
  }
  return res.json();
}

const schema = readFileSync('./supabase/migrations/001_initial_schema.sql', 'utf8');
const seed = readFileSync('./supabase/seed/002_seed.sql', 'utf8');

console.log('Aplicando schema...');
try {
  await runSQL(schema);
  console.log('Schema aplicado!');
} catch (e) {
  console.error('Erro no schema:', e.message);
}

console.log('Aplicando seed...');
try {
  await runSQL(seed);
  console.log('Seed aplicado!');
} catch (e) {
  console.error('Erro no seed:', e.message);
}
