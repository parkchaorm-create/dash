'use client'

import { useState } from 'react'
import { Proposal } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Loader2 } from 'lucide-react'

export default function PaymentButton({ proposal }: { proposal: Proposal }) {
  const [loading, setLoading] = useState<'deposit' | 'full' | null>(null)

  async function handlePay(type: 'deposit' | 'full') {
    setLoading(type)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: proposal.id, paymentType: type }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Payment setup failed')
        return
      }

      const { url } = await res.json()
      window.location.href = url
    } catch {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(null)
    }
  }

  const hasDeposit = !!proposal.deposit_amount
  const hasTotal = !!proposal.total_amount

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold">결제 진행</h2>
          <p className="text-green-100 text-xs mt-0.5">서명이 완료되었습니다. 이제 결제를 진행하세요.</p>
        </div>
      </div>

      <div className="p-8">
        <p className="text-slate-500 text-sm leading-relaxed mb-6 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          Stripe를 통한 안전한 결제입니다. 카드 정보는 당사 서버에 저장되지 않습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {hasDeposit && (
            <Button
              onClick={() => handlePay('deposit')}
              disabled={!!loading}
              className="flex-1 h-13 gap-2 bg-slate-900 hover:bg-slate-800 py-3 flex-col items-center h-auto"
            >
              {loading === 'deposit' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span className="text-xs text-slate-300">계약금 결제</span>
              {proposal.deposit_amount && (
                <span className="text-lg font-bold">{formatCurrency(proposal.deposit_amount)}</span>
              )}
            </Button>
          )}

          {hasTotal && (
            <Button
              onClick={() => handlePay('full')}
              disabled={!!loading}
              variant={hasDeposit ? 'outline' : 'default'}
              className="flex-1 gap-2 flex-col items-center h-auto py-3"
            >
              {loading === 'full' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span className="text-xs">전액 결제</span>
              {proposal.total_amount && (
                <span className="text-lg font-bold">{formatCurrency(proposal.total_amount)}</span>
              )}
            </Button>
          )}

          {!hasDeposit && !hasTotal && (
            <p className="text-sm text-slate-500">
              결제 금액이 설정되지 않았습니다. 담당자에게 문의해 주세요.
            </p>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-5 text-center flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          256비트 SSL 암호화 · Stripe 결제 보안
        </p>
      </div>
    </div>
  )
}
