'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Proposal, Signature } from '@/types'
import ProposalRenderer from './ProposalRenderer'
import SignatureSection from './SignatureSection'
import PaymentButton from './PaymentButton'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, FileText, PenLine, CreditCard } from 'lucide-react'

interface ProposalPublicPageProps {
  proposal: Proposal
  existingSignature: Signature | null
}

export default function ProposalPublicPage({
  proposal,
  existingSignature,
}: ProposalPublicPageProps) {
  const searchParams = useSearchParams()
  const [signed, setSigned] = useState(!!existingSignature)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true)
    }
  }, [searchParams])

  const isPaid = proposal.status === 'paid' || paymentSuccess
  const canPay =
    (signed || proposal.status === 'signed' || proposal.status === 'paid') && !isPaid

  const step = isPaid ? 3 : signed ? 2 : 1

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── 상단 바 ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* 브랜드 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-800">ProposalFlow</span>
            </div>

            {/* 진행 상태 스텝 */}
            <div className="hidden sm:flex items-center gap-1">
              <StepChip active={step >= 1} done={step > 1} number={1} label="검토" />
              <div className="w-8 h-px bg-slate-200" />
              <StepChip active={step >= 2} done={step > 2} number={2} label="서명" />
              <div className="w-8 h-px bg-slate-200" />
              <StepChip active={step >= 3} done={step >= 3} number={3} label="결제" />
            </div>

            {/* 금액 뱃지 */}
            {proposal.total_amount && (
              <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {formatCurrency(proposal.total_amount)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 결제 성공 배너 ── */}
      {paymentSuccess && (
        <div className="bg-green-500 text-white">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">
              결제가 완료되었습니다! 곧 연락드리겠습니다.
            </p>
          </div>
        </div>
      )}

      {/* ── 본문 ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          {/* 제안서 렌더러 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 px-6 sm:px-12 py-10 mb-10">
            <ProposalRenderer proposal={proposal} />
          </div>

          {/* ── 서명 & 결제 영역 ── */}
          {!isPaid && (
            <div className="space-y-6">
              {/* 단계 안내 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <StepDot done={step > 1} active={step === 1} label="1" />
                  <span className={`text-sm font-medium ${step === 1 ? 'text-slate-900' : step > 1 ? 'text-green-600' : 'text-slate-400'}`}>
                    제안서 검토
                  </span>
                </div>
                <div className="flex-1 h-px bg-slate-100" />
                <div className="flex items-center gap-3">
                  <StepDot done={step > 2} active={step === 2} label="2" />
                  <span className={`text-sm font-medium ${step === 2 ? 'text-slate-900' : step > 2 ? 'text-green-600' : 'text-slate-400'}`}>
                    전자 서명
                  </span>
                </div>
                <div className="flex-1 h-px bg-slate-100" />
                <div className="flex items-center gap-3">
                  <StepDot done={step > 3} active={step === 3} label="3" />
                  <span className={`text-sm font-medium ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                    결제
                  </span>
                </div>
              </div>

              {/* 서명 섹션 */}
              {!signed && (
                <SignatureSection
                  proposal={proposal}
                  onSigned={() => setSigned(true)}
                />
              )}

              {/* 서명 완료 알림 */}
              {signed && !isPaid && (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <PenLine className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">서명이 완료되었습니다</p>
                      <p className="text-sm text-green-700 mt-0.5">
                        이제 결제를 진행하시면 프로젝트가 시작됩니다.
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 ml-auto" />
                  </div>
                </div>
              )}

              {/* 결제 버튼 */}
              {canPay && <PaymentButton proposal={proposal} />}
            </div>
          )}

          {/* ── 완료 상태 ── */}
          {isPaid && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">
                서명 및 결제 완료
              </h3>
              <p className="text-green-700 text-sm leading-relaxed">
                제안서 승인과 결제가 완료되었습니다.<br />
                담당자가 곧 연락하여 킥오프 일정을 안내드리겠습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 푸터 ── */}
      <footer className="mt-16 pb-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-xs text-slate-400">
            이 제안서는 ProposalFlow를 통해 작성되었습니다 &nbsp;·&nbsp; 유효기간:{' '}
            {proposal.content?.meta?.valid_until}
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ── 서브 컴포넌트 ── */

function StepChip({
  active,
  done,
  number,
  label,
}: {
  active: boolean
  done: boolean
  number: number
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
          done
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        {done ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span
        className={`text-xs font-medium ${
          done ? 'text-green-600' : active ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean
  done: boolean
  label: string
}) {
  return (
    <div
      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
        done
          ? 'bg-green-500 text-white'
          : active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-400'
      }`}
    >
      {done ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        label
      )}
    </div>
  )
}
