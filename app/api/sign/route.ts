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

  // Verify proposal exists
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

  // 서명 이미지를 Storage에 업로드 (base64 → PNG 파일)
  let signatureStoragePath: string | null = null
  if (signatureData && signatureData.startsWith('data:image/png;base64,')) {
    try {
      const base64 = signatureData.replace('data:image/png;base64,', '')
      const buffer = Buffer.from(base64, 'base64')
      const filePath = `${proposalId}/signature.png`

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, buffer, {
          contentType: 'image/png',
          upsert: true,
        })

      if (!uploadError) {
        signatureStoragePath = filePath
      }
    } catch {
      // 업로드 실패 시 무시하고 계속 진행
    }
  }

  // Save signature record
  const { error: sigError } = await supabase
    .from('signatures')
    .upsert({
      proposal_id: proposalId,
      signer_name: signerName,
      signer_email: signerEmail,
      signature_data: signatureStoragePath ?? signatureData ?? null,
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
