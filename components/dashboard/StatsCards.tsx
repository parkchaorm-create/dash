import { formatCurrency } from '@/lib/utils'
import { FileText, Send, PenLine, DollarSign } from 'lucide-react'

interface Stats {
  total: number
  sent: number
  signed: number
  paid: number
  totalValue: number
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total Proposals',
      value: stats.total,
      icon: FileText,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Signed',
      value: stats.signed,
      icon: PenLine,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Revenue Collected',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">{card.label}</span>
            <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
