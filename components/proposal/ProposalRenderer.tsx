import { Proposal } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function ProposalRenderer({ proposal }: { proposal: Proposal }) {
  const { content } = proposal

  if (!content || !content.meta) {
    return <p className="text-slate-500">제안서 내용을 불러오는 중입니다...</p>
  }

  const totalInvestment =
    content.investment?.reduce((sum, item) => sum + item.amount, 0) ||
    proposal.total_amount ||
    0

  return (
    <article className="proposal-body">

      {/* ── 커버 ── */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mb-16">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        <div className="relative px-10 py-14 md:px-16 md:py-20">
          {/* 제안서 라벨 */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold text-blue-200 tracking-widest uppercase">
              제안서 · {content.meta.proposal_number}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
            {proposal.project_title}
          </h1>

          <p className="text-slate-300 text-lg mb-12">
            <span className="text-white font-semibold">{content.meta.prepared_for}</span>
            {' '}귀하께 드리는 제안서
          </p>

          {/* 메타 정보 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
            <MetaCell label="제안사" value={content.meta.prepared_by} />
            <MetaCell label="제안일" value={content.meta.date} />
            <MetaCell label="유효기간" value={content.meta.valid_until} />
            {totalInvestment > 0 && (
              <MetaCell
                label="총 견적금액"
                value={formatCurrency(totalInvestment)}
                highlight
              />
            )}
          </div>
        </div>
      </header>

      {/* ── 목차 ── */}
      <div className="mb-16 bg-slate-50 rounded-2xl border border-slate-100 px-8 py-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">목차</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { n: '01', t: '제안 개요' },
            { n: '02', t: '회사 소개' },
            { n: '03', t: '프로젝트 이해' },
            { n: '04', t: '제안 솔루션' },
            { n: '05', t: '업무 범위' },
            { n: '06', t: '프로젝트 일정' },
            { n: '07', t: '견적' },
            { n: '08', t: '이용약관' },
            { n: '09', t: '다음 단계' },
          ].map((item) => (
            <div key={item.n} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-bold text-blue-400 w-6 shrink-0">{item.n}</span>
              <span className="text-sm text-slate-600">{item.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 섹션들 ── */}
      <div className="space-y-16">
        <Section number="01" title="제안 개요">
          <Prose text={content.executive_summary} />
        </Section>

        <Section number="02" title="회사 소개">
          <Prose text={content.about_us} />
        </Section>

        <Section number="03" title="프로젝트 이해">
          <Prose text={content.project_understanding} />
        </Section>

        <Section number="04" title="제안 솔루션">
          <Prose text={content.proposed_solution} />
        </Section>

        {/* 업무 범위 */}
        {content.scope_of_work?.length > 0 && (
          <Section number="05" title="업무 범위">
            <div className="space-y-4">
              {content.scope_of_work.map((item, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-slate-900">{item.phase}</h3>
                  </div>
                  <div className="px-6 py-5">
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.deliverables?.map((d, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-700 leading-relaxed">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 타임라인 */}
        {content.timeline?.length > 0 && (
          <Section number="06" title="프로젝트 일정">
            <div className="relative">
              {/* 세로 선 */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100" />
              <div className="space-y-2">
                {content.timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-6 pl-14">
                    {/* 원형 번호 */}
                    <div className="absolute left-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center z-10 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-slate-100 px-6 py-5 mb-3 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{item.phase}</h3>
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* 견적 */}
        {content.investment?.length > 0 && (
          <Section number="07" title="견적">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4">항목</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-4 hidden sm:table-cell">설명</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider px-6 py-4">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {content.investment.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800">{item.item}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-slate-500 leading-relaxed">{item.description}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td className="px-6 py-5 font-bold text-sm" colSpan={2}>합계</td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xl font-bold">{formatCurrency(totalInvestment)}</span>
                    </td>
                  </tr>
                  {proposal.deposit_amount && (
                    <tr className="bg-blue-50 border-t border-blue-100">
                      <td className="px-6 py-4 text-sm font-medium text-blue-900" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          서명 후 선금 (계약금)
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-800">
                        {formatCurrency(proposal.deposit_amount)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </Section>
        )}

        {/* 이용약관 */}
        <Section number="08" title="이용약관">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 px-8 py-6">
            <Prose text={content.terms} muted />
          </div>
        </Section>

        {/* 다음 단계 */}
        <Section number="09" title="다음 단계">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full translate-y-1/3 translate-x-1/3 blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">
                지금 시작하세요
              </p>
              <Prose text={content.next_steps} white />
            </div>
          </div>
        </Section>
      </div>
    </article>
  )
}

/* ── 서브 컴포넌트 ── */

function MetaCell({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`px-6 py-5 ${highlight ? 'bg-blue-500/20' : 'bg-white/5'}`}>
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-blue-200 text-base' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function Section({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-7">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold shrink-0">
          {number}
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </section>
  )
}

function Prose({
  text,
  white,
  muted,
}: {
  text: string
  white?: boolean
  muted?: boolean
}) {
  const paragraphs = (text || '').split('\n').filter(Boolean)
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={`text-[15px] leading-[1.85] ${
            white
              ? 'text-slate-300'
              : muted
              ? 'text-slate-600'
              : 'text-slate-700'
          }`}
        >
          {p}
        </p>
      ))}
    </div>
  )
}
