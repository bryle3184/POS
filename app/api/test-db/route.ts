import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const results: Record<string, unknown> = {}

  // Test read on each table
  for (const table of ['customers', 'products', 'sales', 'sale_items']) {
    const { data, error } = await supabase.from(table).select('id').limit(1)
    results[table] = error
      ? { ok: false, error: error.message, code: error.code, hint: error.hint }
      : { ok: true, rows: data?.length ?? 0 }
  }

  // Test insert on customers (then immediately delete it)
  const { data: insertData, error: insertError } = await supabase
    .from('customers')
    .insert([{ name: '__test__', email: `test-${Date.now()}@test.com`, phone: '', address: '', total_orders: 0, total_spent: 0 }])
    .select()
    .single()

  if (insertError) {
    results['insert_test'] = { ok: false, error: insertError.message, code: insertError.code, hint: insertError.hint }
  } else {
    results['insert_test'] = { ok: true, id: insertData.id }
    // Clean up
    await supabase.from('customers').delete().eq('id', insertData.id)
  }

  return NextResponse.json(results)
}
