import { createClient } from '@/lib/supabase/server'
import { generateProposalContent } from '@/lib/ai'
import { generateSlug } from '@/lib/slug'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    briefText,
    clientName,
    clientEmail,
    clientCompany,
    projectTitle,
    totalAmount,
    depositAmount,
  } = body

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
        brief_text: briefText,
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
