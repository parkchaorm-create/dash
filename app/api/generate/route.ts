import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateProposalContent } from '@/lib/ai'
import { generateSlug } from '@/lib/slug'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = request.headers.get('content-type') || ''
  let briefText = ''
  let clientName = ''
  let clientEmail = ''
  let clientCompany = ''
  let projectTitle = ''
  let totalAmount = ''
  let depositAmount = ''
  let briefFileUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    // 파일 업로드 포함 FormData
    const fd = await request.formData()
    briefText = (fd.get('briefText') as string) || ''
    clientName = (fd.get('clientName') as string) || ''
    clientEmail = (fd.get('clientEmail') as string) || ''
    clientCompany = (fd.get('clientCompany') as string) || ''
    projectTitle = (fd.get('projectTitle') as string) || ''
    totalAmount = (fd.get('totalAmount') as string) || ''
    depositAmount = (fd.get('depositAmount') as string) || ''

    const briefFile = fd.get('briefFile') as File | null
    if (briefFile && briefFile.size > 0) {
      // 파일을 Supabase Storage briefs/{userId}/{timestamp}-{filename} 에 저장
      const adminSupabase = createAdminClient()
      const ext = briefFile.name.split('.').pop() || 'bin'
      const filePath = `${user.id}/${Date.now()}-brief.${ext}`
      const buffer = Buffer.from(await briefFile.arrayBuffer())

      const { error: uploadError } = await adminSupabase.storage
        .from('briefs')
        .upload(filePath, buffer, {
          contentType: briefFile.type || 'application/octet-stream',
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = adminSupabase.storage
          .from('briefs')
          .getPublicUrl(filePath)
        briefFileUrl = urlData?.publicUrl ?? null

        // txt/md 파일이면 텍스트 추출
        if (!briefText && (briefFile.type === 'text/plain' || ['txt', 'md'].includes(ext))) {
          briefText = Buffer.from(await briefFile.arrayBuffer()).toString('utf-8')
        }
      }
    }
  } else {
    // JSON
    const body = await request.json()
    briefText = body.briefText || ''
    clientName = body.clientName || ''
    clientEmail = body.clientEmail || ''
    clientCompany = body.clientCompany || ''
    projectTitle = body.projectTitle || ''
    totalAmount = body.totalAmount || ''
    depositAmount = body.depositAmount || ''
  }

  if (!briefText || !clientName || !clientEmail || !projectTitle) {
    return NextResponse.json(
      { error: 'Missing required fields: briefText, clientName, clientEmail, projectTitle' },
      { status: 400 }
    )
  }

  // Get user's profile for "prepared by"
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company')
    .eq('id', user.id)
    .single()

  const preparedBy = profile?.company || profile?.full_name || user.email || 'Your Agency'

  try {
    const content = await generateProposalContent({
      briefText,
      clientName,
      clientEmail,
      clientCompany,
      projectTitle,
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
      preparedBy,
    })

    // Generate unique slug
    let slug = generateSlug()
    let slugExists = true
    while (slugExists) {
      const { data } = await supabase
        .from('proposals')
        .select('id')
        .eq('slug', slug)
        .single()
      if (!data) {
        slugExists = false
      } else {
        slug = generateSlug()
      }
    }

    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        slug,
        status: 'draft',
        client_name: clientName,
        client_email: clientEmail,
        client_company: clientCompany || null,
        project_title: projectTitle,
        content,
        brief_text: briefFileUrl ? `[파일: ${briefFileUrl}]\n\n${briefText}` : briefText,
        total_amount: totalAmount ? parseFloat(totalAmount) : null,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(proposal)
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate proposal content' },
      { status: 500 }
    )
  }
}
