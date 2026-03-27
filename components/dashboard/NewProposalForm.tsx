'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function NewProposalForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate proposal')
      }

      const proposal = await res.json()
      toast({ title: 'Proposal generated!', description: 'Redirecting to your new proposal...' })
      router.push(`/dashboard/proposals/${proposal.id}`)
    } catch (err: unknown) {
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
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
        <h2 className="font-semibold text-slate-900">Client Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Jane Smith"
              value={form.clientName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">Client Email *</Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="jane@company.com"
              value={form.clientEmail}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientCompany">Company</Label>
            <Input
              id="clientCompany"
              name="clientCompany"
              placeholder="Acme Inc."
              value={form.clientCompany}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectTitle">Project Title *</Label>
            <Input
              id="projectTitle"
              name="projectTitle"
              placeholder="Website Redesign & Development"
              value={form.projectTitle}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Investment */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Investment (Optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalAmount">Total Amount ($)</Label>
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
            <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
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
          <h2 className="font-semibold text-slate-900">Project Brief *</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Paste the client&apos;s brief, RFP, email thread, or describe the project in detail. The more context, the better the proposal.
          </p>
        </div>
        <Textarea
          id="briefText"
          name="briefText"
          placeholder="We're looking to redesign our e-commerce website. Currently we're using Shopify but want to migrate to a custom solution. Key goals: improve conversion rate, modernize the design, add a loyalty program..."
          value={form.briefText}
          onChange={handleChange}
          required
          className="min-h-[200px] resize-y"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 gap-2 text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating proposal with AI...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Proposal
          </>
        )}
      </Button>
    </form>
  )
}
