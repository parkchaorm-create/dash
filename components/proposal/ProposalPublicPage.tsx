'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Proposal, Signature } from '@/types'
import ProposalRenderer from './ProposalRenderer'
import SignatureSection from './SignatureSection'
import PaymentButton from './PaymentButton'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, FileText, PenLine, Sparkles, CalendarCheck, ArrowRight } from 'lucide-react'

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
  const confettiFired = useRef(false)

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true)
    }
  }, [searchParams])

  useEffect(() => {
    // 페이지 접속 시 조회 기록
    fetch(`/api/proposals/${proposal.id}/view`, { method: 'POST' }).catch(() => {})
  }, [proposal.id])

  // Confetti 효과 — 결제 성공 시 발동
  useEffect(() => {
    if (!paymentSuccess || confettiFired.current) return
    confettiFired.current = true

    import('canvas-confetti').then(({ default: confetti }) => {
      const duration = 3000
      const end = Date.now() + duration

      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

      // 첫 번째 폭죽
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors,
        scalar: 1.1,
      })

      // 이후 좌우에서 연속 발사
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval)
          return
        }
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors,
        })
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors,
        })
      }, 300)
    })
  }, [paymentSuccess])

  const isPaid = proposal.status === 'paid' || paymentSuccess
  const canPay =
    (signed || proposal.status === 'signed' || proposal.status === 'paid') && !isPaid

  const step = isPaid ? 3 : signed ? 2 : 1

  // 결제 완료 전체 화면
  if (isPaid) {
    return <PaymentSuccessPage proposal={proposal} />
  }

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

      {/* ── 본문 ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          {/* 제안서 렌더러 */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 px-6 sm:px-12 py-10 mb-10">
            <ProposalRenderer proposal={proposal} />
          </div>

          {/* ── 서명 & 결제 영역 ── */}
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
            {signed && (
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

/* ── 결제 완료 전체 화면 ── */
function PaymentSuccessPage({ proposal }: { proposal: Proposal }) {
  const [visible, setVisible] = useState(false)
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || ''

  useEffect(() => {
    // 살짝 딜레이 후 페이드인
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-5">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10" />
      </div>

      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* 체크 아이콘 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* 링 애니메이션 */}
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-30" />
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-green-300" />
            <span className="text-xs font-semibold text-green-300 tracking-wider uppercase">결제 완료</span>
          </div>

          <h1 className="text-3xl font-bold mb-3">감사합니다!</h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            <strong className="text-white">{proposal.project_title}</strong>에 대한<br />
            결제가 성공적으로 완료되었습니다.
          </p>

          {/* 요약 정보 */}
          <div className="bg-white/8 rounded-2xl p-6 space-y-3 mb-8 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">프로젝트</span>
              <span className="text-white font-medium">{proposal.project_title}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">클라이언트</span>
              <span className="text-white font-medium">{proposal.client_name}</span>
            </div>
            {proposal.deposit_amount && (
              <>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">결제 금액</span>
                  <span className="text-green-300 font-bold">{formatCurrency(proposal.deposit_amount)}</span>
                </div>
              </>
            )}
          </div>

          {/* 캘린더 예약 버튼 */}
          {calendarUrl ? (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-400 text-white font-semibold rounded-2xl px-6 py-4 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-400/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarCheck className="w-5 h-5" />
              킥오프 미팅 예약하기
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <p className="text-slate-400 text-sm leading-relaxed">
              담당자가 <strong className="text-slate-200">{proposal.client_email}</strong>으로<br />
              48시간 이내에 킥오프 일정을 안내드리겠습니다.
            </p>
          )}
        </div>

        {/* 하단 브랜드 */}
        <p className="text-center text-slate-500 text-xs mt-8">
          Powered by ProposalFlow
        </p>
      </div>
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
