import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface Props {
  searchParams?: Promise<{ workspaceId?: string }>
}

export default async function ClassMembersRedirect({ searchParams }: Props) {
  const { workspaceId } = (await searchParams) || {}
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let wsQuery = supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .eq('type', 'class')
    .eq('is_active', true)

  if (workspaceId) {
    wsQuery = wsQuery.eq('id', workspaceId)
  }

  const { data: workspace } = await wsQuery
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!workspace) redirect('/workspace/new?type=class')

  const { data: classGroup } = await supabase
    .from('class_groups')
    .select('id')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('name')
    .limit(1)
    .maybeSingle()

  if (!classGroup) redirect('/class/new')

  redirect(`/class/${classGroup.id}/members`)
}
