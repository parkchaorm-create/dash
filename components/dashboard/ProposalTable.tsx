'use client'

import Link from 'next/link'
import { Proposal } from '@/types'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ExternalLink, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

export default function ProposalTable({
  proposals,
  viewCounts = {},
}: {
  proposals: Proposal[]
  viewCounts?: Record<string, number>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this proposal? This cannot be undone.')) return
    setDeleting(id)
    const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Proposal deleted' })
      router.refresh()
    } else {
      toast({ title: 'Error deleting proposal', variant: 'destructive' })
    }
    setDeleting(null)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3">
              Client / Project
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">
              Status
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3 hidden md:table-cell">
              조회수
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3 hidden md:table-cell">
              금액
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3 hidden lg:table-cell">
              Created
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <Link href={`/dashboard/proposals/${proposal.id}`} className="block group">
                  <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                    {proposal.project_title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {proposal.client_name}
                    {proposal.client_company ? ` · ${proposal.client_company}` : ''}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                <StatusBadge status={proposal.status} />
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{viewCounts[proposal.id] || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <span className="text-sm text-slate-700">
                  {proposal.total_amount ? formatCurrency(proposal.total_amount) : '—'}
                </span>
              </td>
              <td className="px-6 py-4 hidden lg:table-cell">
                <span className="text-sm text-slate-500">{formatDate(proposal.created_at)}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 justify-end">
                  <a
                    href={`/p/${proposal.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open public link"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => handleDelete(proposal.id)}
                    disabled={deleting === proposal.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
