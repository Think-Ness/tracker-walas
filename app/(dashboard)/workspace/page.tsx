import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceSelectorClient } from './WorkspaceSelectorClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pilih Workspace',
}

export default async function WorkspacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <WorkspaceSelectorClient
      workspaces={(workspaces as any) ?? []}
      userName={profile?.full_name}
    />
  )
}
