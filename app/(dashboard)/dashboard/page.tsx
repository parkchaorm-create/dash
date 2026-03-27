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

  // 제안서별 조회수 가져오기
  const proposalIds = typedProposals.map((p) => p.id)
  let viewCounts: Record<string, number> = {}

  if (proposalIds.length > 0) {
    const { data: views } = await supabase
      .from('proposal_views')
      .select('proposal_id')
      .in('proposal_id', proposalIds)

    if (views) {
      views.forEach((v) => {
        viewCounts[v.proposal_id] = (viewCounts[v.proposal_id] || 0) + 1
      })
    }
  }

  const stats = {
    total: typedProposals.length,
    sent: typedProposals.filter((p) => p.status === 'sent').length,
    signed: typedProposals.filter((p) => p.status === 'signed').length,
    paid: typedProposals.filter((p) => p.status === 'paid').length,
    totalValue: typedProposals
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0),
    totalViews: Object.values(viewCounts).reduce((sum, v) => sum + v, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">제안서</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            클라이언트 제안서를 생성하고 추적하세요
          </p>
        </div>
        <Link href="/dashboard/proposals/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            새 제안서
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
          <h3 className="font-semibold text-slate-900 mb-1">제안서가 없습니다</h3>
          <p className="text-slate-500 text-sm mb-4">
            클라이언트 브리프를 업로드하여 첫 번째 제안서를 만들어보세요.
          </p>
          <Link href="/dashboard/proposals/new">
            <Button>첫 제안서 만들기</Button>
          </Link>
        </div>
      ) : (
        <ProposalTable proposals={typedProposals} viewCounts={viewCounts} />
      )}
    </div>
  )
}
