import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProposalTable from '@/components/dashboard/ProposalTable'
import StatsCards from '@/components/dashboard/StatsCards'
import { Proposal } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: proposals } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const typedProposals = (proposals || []) as Proposal[]

  const stats = {
    total: typedProposals.length,
    sent: typedProposals.filter((p) => p.status === 'sent').length,
    signed: typedProposals.filter((p) => p.status === 'signed').length,
    paid: typedProposals.filter((p) => p.status === 'paid').length,
    totalValue: typedProposals
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage and track all your client proposals
          </p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Proposals Table */}
      {typedProposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No proposals yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Create your first proposal by uploading a client brief.
          </p>
          <Link href="/dashboard/proposals/new">
            <Button>Create first proposal</Button>
          </Link>
        </div>
      ) : (
        <ProposalTable proposals={typedProposals} />
      )}
    </div>
  )
}
