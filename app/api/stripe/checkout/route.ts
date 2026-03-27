import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { proposalId, paymentType } = body

  if (!proposalId) {
    return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single()

  if (error || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  if (proposal.status !== 'signed') {
    return NextResponse.json(
      { error: 'Proposal must be signed before payment' },
      { status: 400 }
    )
  }

  const isDeposit = paymentType === 'deposit' && proposal.deposit_amount
  const amount = isDeposit ? proposal.deposit_amount : proposal.total_amount

  if (!amount) {
    return NextResponse.json({ error: 'No payment amount set on proposal' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: isDeposit
              ? `Deposit — ${proposal.project_title}`
              : proposal.project_title,
            description: `Proposal for ${proposal.client_name}`,
          },
          unit_amount: Math.round(amount * 100), // Stripe expects cents
        },
        quantity: 1,
      },
    ],
    customer_email: proposal.client_email,
    metadata: {
      proposal_id: proposalId,
      payment_type: isDeposit ? 'deposit' : 'full',
    },
    success_url: `${appUrl}/p/${proposal.slug}?payment=success`,
    cancel_url: `${appUrl}/p/${proposal.slug}?payment=cancelled`,
  })

  // Create a pending payment record
  await supabase.from('payments').insert({
    proposal_id: proposalId,
    stripe_session_id: session.id,
    amount,
    currency: 'usd',
    payment_type: isDeposit ? 'deposit' : 'full',
    status: 'pending',
  })

  // Update proposal with session ID
  await supabase
    .from('proposals')
    .update({ stripe_session_id: session.id })
    .eq('id', proposalId)

  return NextResponse.json({ url: session.url })
}
