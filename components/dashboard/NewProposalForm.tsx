'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Upload, X, FileText, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const GENERATION_STEPS = [
  { label: '브리프 분석 중...', duration: 3000 },
  { label: 'AI가 제안서 구조 설계 중...', duration: 4000 },
  { label: '섹션별 내용 작성 중...', duration: 5000 },
  { label: '견적 및 일정 계산 중...', duration: 3000 },
  { label: '최종 검토 및 마무리 중...', duration: 99999 },
]

export default function NewProposalForm() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [briefFile, setBriefFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!loading) {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      setStepIndex(0)
      setProgress(0)
      return
    }

    // 단계 순서대로 전진
    let currentStep = 0
    function advanceStep() {
      currentStep += 1
      if (currentStep < GENERATION_STEPS.length) {
        setStepIndex(currentStep)
        stepTimerRef.current = setTimeout(advanceStep, GENERATION_STEPS[currentStep].duration)
      }
    }
    stepTimerRef.current = setTimeout(advanceStep, GENERATION_STEPS[0].duration)

    // 프로그레스 바: 90%까지 천천히 차오름 (나머지 10%는 완료 시)
    setProgress(0)
    const totalEstimated = 18000
    const interval = 200
    let elapsed = 0
    progressTimerRef.current = setInterval(() => {
      elapsed += interval
      const pct = Math.min(90, Math.round((elapsed / totalEstimated) * 90))
      setProgress(pct)
    }, interval)

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [loading])

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    projectTitle: '',
    totalAmount: '',
    depositAmount: '',
    briefText: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function loadTextFile(file: File) {
    const text = await file.text()
    setForm((prev) => ({ ...prev, briefText: text }))
    setBriefFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      loadTextFile(file)
    } else {
      setBriefFile(file)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      loadTextFile(file)
    } else {
      setBriefFile(file)
      toast({ title: '.txt / .md 파일만 자동으로 텍스트가 입력됩니다.' })
    }
  }

  function removeFile() {
    setBriefFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // 브리프 파일이 있으면 FormData로, 없으면 JSON으로 전송
      let res: Response

      if (briefFile && !['text/plain'].includes(briefFile.type) && !briefFile.name.endsWith('.txt') && !briefFile.name.endsWith('.md')) {
        // PDF/Word 등 바이너리 파일 → FormData
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        fd.append('briefFile', briefFile)
        res = await fetch('/api/generate', { method: 'POST', body: fd })
      } else {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '제안서 생성에 실패했습니다')
      }

      const proposal = await res.json()
      setProgress(100)
      await new Promise((r) => setTimeout(r, 400))
      toast({ title: '제안서가 생성되었습니다!', description: '제안서 페이지로 이동합니다...' })
      router.push(`/dashboard/proposals/${proposal.id}`)
    } catch (err: unknown) {
      toast({
        title: '생성 실패',
        description: err instanceof Error ? err.message : '다시 시도해 주세요.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">클라이언트 정보</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">이름 *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="홍길동"
              value={form.clientName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">이메일 *</Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="hong@company.com"
              value={form.clientEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientCompany">회사명</Label>
            <Input
              id="clientCompany"
              name="clientCompany"
              placeholder="(주)홍길동"
              value={form.clientCompany}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectTitle">프로젝트 제목 *</Label>
            <Input
              id="projectTitle"
              name="projectTitle"
              placeholder="웹사이트 리디자인 및 개발"
              value={form.projectTitle}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Investment */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">금액 (선택사항)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalAmount">총 금액 ($)</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="15000"
              value={form.totalAmount}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="depositAmount">계약금 ($)</Label>
            <Input
              id="depositAmount"
              name="depositAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="7500"
              value={form.depositAmount}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Project Brief */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">프로젝트 브리프 *</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            클라이언트 브리프, RFP, 이메일 내용을 붙여넣거나 파일로 업로드하세요.
          </p>
        </div>

        {/* 파일 업로드 드롭존 */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
            dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          {briefFile ? (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="font-medium truncate max-w-[240px]">{briefFile.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile() }}
                className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Upload className="w-4 h-4" />
              <span>파일 드래그 또는 클릭 (.txt .md .pdf .doc)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">또는 직접 입력</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <Textarea
          id="briefText"
          name="briefText"
          placeholder="저희는 e-커머스 웹사이트를 리디자인하려고 합니다. 현재 Shopify를 사용 중이나 커스텀 솔루션으로 전환을 원합니다. 주요 목표: 전환율 향상, 디자인 현대화, 로열티 프로그램 추가..."
          value={form.briefText}
          onChange={handleChange}
          required={!briefFile}
          className="min-h-[180px] resize-y"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {/* 단계 목록 */}
          <div className="space-y-2.5">
            {GENERATION_STEPS.slice(0, -1).map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                {i < stepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : i === stepIndex ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                )}
                <span
                  className={`text-sm transition-colors ${
                    i < stepIndex
                      ? 'text-slate-400 line-through'
                      : i === stepIndex
                      ? 'text-slate-900 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
            {/* 마지막 단계 */}
            <div className="flex items-center gap-3">
              {stepIndex >= GENERATION_STEPS.length - 1 ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
              )}
              <span
                className={`text-sm transition-colors ${
                  stepIndex >= GENERATION_STEPS.length - 1
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {GENERATION_STEPS[GENERATION_STEPS.length - 1].label}
              </span>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-right">{progress}%</p>
          </div>

          <p className="text-xs text-slate-400 text-center">
            보통 15–30초 소요됩니다. 페이지를 닫지 마세요.
          </p>
        </div>
      ) : (
        <Button
          type="submit"
          className="w-full h-12 gap-2 text-base"
          disabled={loading}
        >
          <Sparkles className="w-5 h-5" />
          AI로 제안서 생성
        </Button>
      )}
    </form>
  )
}
