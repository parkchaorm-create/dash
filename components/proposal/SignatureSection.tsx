'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Proposal } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, PenLine, RotateCcw } from 'lucide-react'

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
  ssr: false,
  loading: () => (
    <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
      <span className="text-slate-400 text-sm">서명 패드 로딩 중...</span>
    </div>
  ),
})

interface SignatureSectionProps {
  proposal: Proposal
  onSigned: () => void
}

export default function SignatureSection({ proposal, onSigned }: SignatureSectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigCanvasRef = useRef<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState(proposal.client_email || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function clearSignature() {
    sigCanvasRef.current?.clear()
  }

  async function handleSign() {
    if (!name || !email) {
      setError('Please enter your name and email.')
      return
    }

    let signatureData: string | null = null

    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      signatureData = sigCanvasRef.current.toDataURL('image/png')
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.id,
          signerName: name,
          signerEmail: email,
          signatureData,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Signing failed')
      }

      onSigned()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* 헤더 */}
      <div className="bg-slate-900 px-8 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <PenLine className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold">전자 서명</h2>
          <p className="text-slate-400 text-xs mt-0.5">서명 후 결제로 진행하실 수 있습니다</p>
        </div>
      </div>

      <div className="p-8">
        <p className="text-slate-500 text-sm leading-relaxed mb-6 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          아래에 서명하시면 본 제안서의 조건에 동의하고 계약금 수령 후 프로젝트를 시작하는 데 동의하는 것으로 간주됩니다.
        </p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="signerName">이름 *</Label>
              <Input
                id="signerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signerEmail">이메일 *</Label>
              <Input
                id="signerEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hong@company.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>서명란</Label>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                지우기
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:border-slate-400 hover:bg-white transition-all">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="#0f172a"
                canvasProps={{
                  className: 'w-full',
                  style: { height: 160, display: 'block' },
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">위 영역에 마우스 또는 터치로 서명해 주세요 (선택사항)</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <Button
            onClick={handleSign}
            className="w-full h-12 gap-2 text-base"
            disabled={submitting || !name || !email}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                제출 중...
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
                서명하고 제안서 수락하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
