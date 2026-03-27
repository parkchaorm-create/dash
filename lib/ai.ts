import Anthropic from '@anthropic-ai/sdk'
import { ProposalContent } from '@/types'
import { defaultTemplate } from '@/templates/default-proposal'

const client = new Anthropic()

interface GenerateProposalInput {
  briefText: string
  clientName: string
  clientEmail: string
  clientCompany?: string
  projectTitle: string
  totalAmount?: number
  depositAmount?: number
  preparedBy: string
}

export async function generateProposalContent(
  input: GenerateProposalInput
): Promise<ProposalContent> {
  const today = new Date()
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const proposalNumber = `PROP-${Date.now().toString().slice(-6)}`

  const prompt = `You are an expert business proposal writer. Generate a high-quality, professional proposal based on the following information.

CLIENT INFORMATION:
- Client Name: ${input.clientName}
- Client Email: ${input.clientEmail}
- Client Company: ${input.clientCompany || 'N/A'}
- Project Title: ${input.projectTitle}

PROJECT BRIEF:
${input.briefText}

FINANCIAL:
- Total Project Value: ${input.totalAmount ? `$${input.totalAmount}` : 'To be determined'}
- Deposit Required: ${input.depositAmount ? `$${input.depositAmount}` : '50% of total'}

PROPOSAL TEMPLATE STRUCTURE:
${JSON.stringify(defaultTemplate.sections, null, 2)}

Generate a complete, compelling proposal. Return ONLY valid JSON matching this exact structure:
{
  "executive_summary": "2-3 paragraph compelling overview of the project and your approach",
  "about_us": "2 paragraphs about the agency/company capabilities and relevant experience",
  "project_understanding": "2-3 paragraphs demonstrating deep understanding of the client's needs and challenges",
  "proposed_solution": "3-4 paragraphs describing your solution, methodology, and unique approach",
  "scope_of_work": [
    {
      "phase": "Phase name",
      "description": "Phase description",
      "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"]
    }
  ],
  "timeline": [
    {
      "phase": "Phase name",
      "duration": "X weeks",
      "description": "What happens during this phase"
    }
  ],
  "investment": [
    {
      "item": "Line item name",
      "description": "What's included",
      "amount": 0
    }
  ],
  "terms": "Payment terms, revision policy, and key contractual points (3-4 sentences)",
  "next_steps": "Clear 3-step call to action for the client",
  "meta": {
    "prepared_for": "${input.clientName}${input.clientCompany ? ` at ${input.clientCompany}` : ''}",
    "prepared_by": "${input.preparedBy}",
    "date": "${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
    "valid_until": "${validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
    "proposal_number": "${proposalNumber}"
  }
}

Make the content professional, specific to the client's needs, and compelling. Use concrete language. Avoid generic filler text.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON')
  }

  const content = JSON.parse(jsonMatch[0]) as ProposalContent

  // Inject actual amounts if provided
  if (input.totalAmount && content.investment) {
    const total = content.investment.reduce((sum, item) => sum + item.amount, 0)
    if (total === 0) {
      // Distribute total amount across line items
      const perItem = input.totalAmount / content.investment.length
      content.investment = content.investment.map((item) => ({
        ...item,
        amount: Math.round(perItem),
      }))
    }
  }

  return content
}
