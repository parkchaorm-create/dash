import NewProposalForm from '@/components/dashboard/NewProposalForm'

export default function NewProposalPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Proposal</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Enter client details and paste your project brief. AI will generate a complete proposal.
        </p>
      </div>
      <NewProposalForm />
    </div>
  )
}
