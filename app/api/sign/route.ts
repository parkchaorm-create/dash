import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { proposalId, signerName, signerEmail, signatureData } = body

  if (!proposalId || !signerName || !signerEmail) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Verify proposal exists and is in 'sent' status
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('id, status')
    .eq('id', proposalId)
    .single()

  if (proposalError || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  if (proposal.status === 'paid') {
    return NextResponse.json({ error: 'Proposal already paid' }, { status: 400 })
  }

  // Get IP and UA from request
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || ''

  // Save signature
  const { error: sigError } = await supabase
    .from('signatures')
    .upsert({
      proposal_id: proposalId,
      signer_name: signerName,
      signer_email: signerEmail,
      signature_data: signatureData || null,
      ip_address: ip,
      user_agent: userAgent,
      signed_at: new Date().toISOString(),
    }, { onConflict: 'proposal_id' })

  if (sigError) {
    return NextResponse.json({ error: sigError.message }, { status: 500 })
  }

  // Update proposal status to 'signed'
  const { error: updateError } = await supabase
    .from('proposals')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
    })
    .eq('id', proposalId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
