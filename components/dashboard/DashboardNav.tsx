'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface DashboardNavProps {
  user: SupabaseUser
  profile: Profile | null
}

export default function DashboardNav({ user, profile }: DashboardNavProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">ProposalFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="hidden sm:block">
                {profile?.full_name || user.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-slate-500">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
