/**
 * Script para aplicar schema e seed no Supabase.
 * Uso: SUPABASE_URL=... SERVICE_ROLE_KEY=... node scripts/setup-db.mjs
 *
 * As variáveis devem ser passadas como env vars ou configuradas no .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente')
  process.exit(1)
}

console.log('Aplicando schema e seed via Supabase SQL Editor:')
console.log('')
console.log('1. Acesse: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('.')[0].split('//')[1])
console.log('2. Vá em SQL Editor')
console.log('3. Cole o conteúdo de supabase/migrations/001_initial_schema.sql e execute')
console.log('4. Cole o conteúdo de supabase/seed/002_seed.sql e execute')
console.log('')
console.log('Ou execute os arquivos SQL diretamente pelo CLI do Supabase:')
console.log('  supabase db push --db-url postgresql://...')
