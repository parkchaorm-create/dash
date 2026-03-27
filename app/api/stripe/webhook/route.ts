import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const proposalId = session.metadata?.proposal_id
    const paymentType = session.metadata?.payment_type as 'deposit' | 'full'

    if (!proposalId) {
      return NextResponse.json({ error: 'No proposal_id in metadata' }, { status: 400 })
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent: session.payment_intent as string,
        completed_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)

    // Update proposal to 'paid'
    await supabase
      .from('proposals')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('id', proposalId)

    console.log(`Proposal ${proposalId} marked as paid (${paymentType})`)
  }

  return NextResponse.json({ received: true })
}
