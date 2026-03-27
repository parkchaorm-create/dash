export type ProposalStatus = 'draft' | 'sent' | 'signed' | 'paid'

export interface Profile {
  id: string
  full_name: string | null
  company: string | null
  created_at: string
}

export interface Proposal {
  id: string
  user_id: string
  slug: string
  status: ProposalStatus
  client_name: string
  client_email: string
  client_company: string | null
  project_title: string
  content: ProposalContent
  brief_text: string | null
  total_amount: number | null
  deposit_amount: number | null
  stripe_payment_intent: string | null
  stripe_session_id: string | null
  sent_at: string | null
  signed_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface ProposalContent {
  executive_summary: string
  about_us: string
  project_understanding: string
  proposed_solution: string
  scope_of_work: ScopeItem[]
  timeline: TimelineItem[]
  investment: InvestmentItem[]
  terms: string
  next_steps: string
  meta: {
    prepared_for: string
    prepared_by: string
    date: string
    valid_until: string
    proposal_number: string
  }
}

export interface ScopeItem {
  phase: string
  description: string
  deliverables: string[]
}

export interface TimelineItem {
  phase: string
  duration: string
  description: string
}

export interface InvestmentItem {
  item: string
  description: string
  amount: number
}

export interface Signature {
  id: string
  proposal_id: string
  signer_name: string
  signer_email: string
  signature_data: string | null
  ip_address: string | null
  user_agent: string | null
  signed_at: string
}

export interface Payment {
  id: string
  proposal_id: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  amount: number
  currency: string
  payment_type: 'deposit' | 'full'
  status: string
  created_at: string
  completed_at: string | null
}
