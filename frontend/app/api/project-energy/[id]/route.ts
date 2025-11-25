import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Supabase logging skipped: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, serviceKey)
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('energy_cost')
      .eq('project_id', params.id)

    if (error) {
      console.error('Failed to fetch project energy usage:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch energy usage' }, { status: 500 })
    }

    const totalEnergy = (data || []).reduce((sum, row: any) => {
      const cost = row.energy_cost ?? 0
      return sum + (cost > 0 ? cost : 0)
    }, 0)

    return NextResponse.json({ success: true, energyCost: totalEnergy })
  } catch (error) {
    console.error('Failed to handle project energy request:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch energy usage' }, { status: 500 })
  }
}
