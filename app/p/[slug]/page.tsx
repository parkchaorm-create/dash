import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Proposal } from '@/types'
import ProposalPublicPage from '@/components/proposal/ProposalPublicPage'

export default async function PublicProposalPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!proposal) notFound()

  const { data: signature } = await supabase
    .from('signatures')
    .select('*')
    .eq('proposal_id', proposal.id)
    .single()

  return (
    <ProposalPublicPage
      proposal={proposal as Proposal}
      existingSignature={signature}
    />
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: proposal } = await supabase
    .from('proposals')
    .select('project_title, client_name')
    .eq('slug', params.slug)
    .single()

  if (!proposal) return { title: 'Proposal' }

  return {
    title: `${proposal.project_title} — Proposal for ${proposal.client_name}`,
  }
}
