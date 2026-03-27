import { Badge } from '@/components/ui/badge'
import { ProposalStatus } from '@/types'

const statusConfig: Record<ProposalStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'purple' }> = {
  draft: { label: 'Draft', variant: 'default' },
  sent: { label: 'Sent', variant: 'info' },
  signed: { label: 'Signed', variant: 'purple' },
  paid: { label: 'Paid', variant: 'success' },
}

export default function StatusBadge({ status }: { status: ProposalStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
