import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''

  await supabase.from('proposal_views').insert({
    proposal_id: params.id,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
