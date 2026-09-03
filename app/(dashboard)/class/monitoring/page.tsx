import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClassMonitoringRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .eq('type', 'class')
    .eq('is_active', true)
    .single()

  if (!workspace) redirect('/workspace/new?type=class')

  const { data: classGroup } = await supabase
    .from('class_groups')
    .select('id')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!classGroup) redirect('/class/new')

  redirect(`/class/${classGroup.id}/monitoring`)
}
