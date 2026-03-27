/**
 * Default high-quality proposal template.
 * This defines the structure and section guidance used when generating proposals via AI.
 * Replace the `guidance` fields with your own proven copy/style notes.
 */

export const defaultTemplate = {
  name: 'Professional Agency Proposal',
  version: '1.0',
  sections: [
    {
      key: 'executive_summary',
      label: 'Executive Summary',
      guidance: `Write a compelling 2-3 paragraph overview that:
- Opens with a statement that shows you understand the client's core challenge
- Briefly describes the transformative outcome you will deliver
- Ends with a confident statement about why your team is the right choice
Tone: confident, client-centric, outcome-focused. No jargon.`,
    },
    {
      key: 'about_us',
      label: 'About Us',
      guidance: `Write 2 paragraphs:
- Paragraph 1: Who we are, how long we've been doing this, and what makes us different
- Paragraph 2: Relevant experience and social proof (types of clients, results achieved)
Tone: credible, warm, specific. Avoid generic agency-speak.`,
    },
    {
      key: 'project_understanding',
      label: 'Project Understanding',
      guidance: `Write 2-3 paragraphs demonstrating deep understanding:
- The client's current situation and the business problem they're trying to solve
- The underlying goals and success criteria (go beyond what they literally said)
- Any challenges or risks we've identified that they may not have mentioned
This section should make the client feel heard and confident you truly understand their world.`,
    },
    {
      key: 'proposed_solution',
      label: 'Our Proposed Solution',
      guidance: `Write 3-4 paragraphs describing:
- Your strategic approach and the "why" behind it
- The core methodology or framework you'll use
- What makes this approach uniquely suited to this client's needs
- How the end result will look and feel for the client
Be specific and visual. Paint a picture of the outcome.`,
    },
    {
      key: 'scope_of_work',
      label: 'Scope of Work',
      guidance: `Break the project into 3-5 logical phases. For each phase:
- Give it a clear name (e.g., "Discovery & Strategy", "Design & Prototyping", "Development", "Launch & Handoff")
- Write 1-2 sentences describing what happens in this phase
- List 3-5 concrete deliverables
Be specific. Every deliverable should be something the client can point to.`,
    },
    {
      key: 'timeline',
      label: 'Project Timeline',
      guidance: `Map each phase of the scope to a realistic timeline:
- Use week ranges (e.g., "Weeks 1–2")
- Include a brief note on what milestones happen in this period
- Keep it honest — don't over-promise speed`,
    },
    {
      key: 'investment',
      label: 'Investment',
      guidance: `Break the total investment into line items:
- Group by phase or by type (e.g., Strategy, Design, Development, QA)
- Each item should have a clear name and 1-sentence description of what's included
- Amounts should add up to the total project value
If deposit is specified, note it as a separate line item labeled "Deposit (due upon signing)".`,
    },
    {
      key: 'terms',
      label: 'Terms & Conditions',
      guidance: `Write 3-4 sentences covering:
- Payment schedule (e.g., "50% deposit upon signing, 50% upon delivery")
- Number of revision rounds included
- What happens if scope changes (change orders)
- Intellectual property transfer upon final payment
Keep it plain English. No legalese.`,
    },
    {
      key: 'next_steps',
      label: 'Next Steps',
      guidance: `Write a clear, numbered 3-step call to action:
1. Review and sign this proposal
2. Submit the deposit to kick off the project
3. Schedule the kickoff call
Make it feel easy and exciting to move forward.`,
    },
  ],
  styling: {
    primaryColor: '#1a1a2e',
    accentColor: '#e94560',
    fontFamily: 'Inter, sans-serif',
    logoText: 'Your Agency',
  },
}

export type DefaultTemplateSection = (typeof defaultTemplate.sections)[number]
