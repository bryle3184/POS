import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Diagnostic endpoint: uses service role key to bypass RLS
// for verifying table existence and writability. NOT for production use.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const results: Record<string, unknown> = {}

  // Test read on each table (bypasses RLS with service role)
  for (const table of ['customers', 'products', 'sales', 'sale_items']) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    results[table] = error
      ? { ok: false, error: error.message, code: error.code, hint: error.hint }
      : { ok: true, rows: data?.length ?? 0 }
  }

  // Check if demo user exists in Auth
  const { data: demoUsers, error: demoError } = await supabase.auth.admin.listUsers()
  const demoUser = demoUsers?.users?.find(u => u.email === 'demo@pos.com')

  results['demo_user'] = demoError
    ? { ok: false, error: demoError.message }
    : { ok: true, exists: !!demoUser, id: demoUser?.id }

  // Test insert on customers using the demo user's ID (then clean up)
  if (demoUser) {
    const { data: insertData, error: insertError } = await supabase
      .from('customers')
      .insert([{
        name: '__test__',
        email: `test-${Date.now()}@test.com`,
        phone: '',
        address: '',
        total_orders: 0,
        total_spent: 0,
        user_id: demoUser.id,
      }])
      .select()
      .single()

    if (insertError) {
      results['insert_test'] = { ok: false, error: insertError.message, code: insertError.code }
    } else {
      results['insert_test'] = { ok: true, id: insertData.id }
      await supabase.from('customers').delete().eq('id', insertData.id)
    }
  } else {
    results['insert_test'] = { ok: 'skipped', reason: 'No demo user found' }
  }

  return NextResponse.json(results)
}
