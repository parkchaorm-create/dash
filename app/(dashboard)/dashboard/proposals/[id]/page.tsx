import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Proposal } from '@/types'
import ProposalDetail from '@/components/dashboard/ProposalDetail'

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!proposal) notFound()

  const { data: signature } = await supabase
    .from('signatures')
    .select('*')
    .eq('proposal_id', params.id)
    .single()

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('proposal_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <ProposalDetail
      proposal={proposal as Proposal}
      signature={signature}
      payments={payments || []}
    />
  )
}
