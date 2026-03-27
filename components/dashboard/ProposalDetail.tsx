'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Proposal, Signature, Payment } from '@/types'
import StatusBadge from './StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Copy, ExternalLink, Send, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ProposalDetailProps {
  proposal: Proposal
  signature: Signature | null
  payments: Payment[]
}

export default function ProposalDetail({ proposal, signature, payments }: ProposalDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const publicUrl = `${appUrl}/p/${proposal.slug}`

  async function handleMarkSent() {
    setSending(true)
    const res = await fetch(`/api/proposals/${proposal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'sent',
        sent_at: new Date().toISOString(),
      }),
    })
    if (res.ok) {
      toast({ title: 'Marked as sent', description: 'Share the link below with your client.' })
      router.refresh()
    }
    setSending(false)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Link copied!' })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{proposal.project_title}</h1>
              <StatusBadge status={proposal.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {proposal.client_name}
              {proposal.client_company ? ` · ${proposal.client_company}` : ''}
              {' · '}
              {proposal.client_email}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <a href={`/p/${proposal.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Preview
            </Button>
          </a>
          {proposal.status === 'draft' && (
            <Button size="sm" className="gap-1.5" onClick={handleMarkSent} disabled={sending}>
              <Send className="w-3.5 h-3.5" />
              Mark as Sent
            </Button>
          )}
        </div>
      </div>

      {/* Public link */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3 text-sm">Client Link</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono truncate border border-slate-200">
            {publicUrl}
          </div>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Value</p>
          <p className="text-xl font-bold text-slate-900">
            {proposal.total_amount ? formatCurrency(proposal.total_amount) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Deposit</p>
          <p className="text-xl font-bold text-slate-900">
            {proposal.deposit_amount ? formatCurrency(proposal.deposit_amount) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Created</p>
          <p className="text-sm font-medium text-slate-900">{formatDate(proposal.created_at)}</p>
        </div>
      </div>

      {/* Signature */}
      {signature && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3 text-sm">Signature</h2>
          <div className="flex items-center gap-4">
            {signature.signature_data && (
              <img
                src={signature.signature_data}
                alt="Signature"
                className="h-16 border border-slate-200 rounded-lg bg-slate-50 p-1"
              />
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">{signature.signer_name}</p>
              <p className="text-xs text-slate-500">{signature.signer_email}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(signature.signed_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-3 text-sm">Payments</h2>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">{payment.payment_type}</p>
                  <p className="text-xs text-slate-500">{formatDate(payment.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                  <span className={`text-xs ${payment.status === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
