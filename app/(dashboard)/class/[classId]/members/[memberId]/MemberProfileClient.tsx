'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/interactive'
import { Button, Badge, Card, EmptyState } from '@/components/ui'
import { formatDate, getRatingLabel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Plus, Brain, FileText, Star, Clock, Edit2 } from 'lucide-react'
import type { ClassMember, MemberMonitoring, MemberInsya, AcademicPotential } from '@/lib/types'
import { getStatusLabel, getStatusVariant } from '@/lib/utils'
import MonitoringForm from './MonitoringForm'
import InsyaForm from './InsyaForm'
import PotentialForm from './PotentialForm'
import AiInsightSection from './AiInsightSection'
import { EditMemberModal } from './EditMemberModal'

interface Props {
  member: ClassMember & { class_groups?: unknown }
  classId: string
  memberId: string
  monitoring: MemberMonitoring[]
  insya: MemberInsya[]
  potential: AcademicPotential[]
  userId: string
}

export default function MemberProfileClient({
  member,
  classId,
  memberId,
  monitoring,
  insya,
  potential,
  userId,
}: Props) {
  const [activeTab, setActiveTab] = useState('monitoring')
  const [showMonitoringForm, setShowMonitoringForm] = useState(false)
  const [showInsyaForm, setShowInsyaForm] = useState(false)
  const [showPotentialForm, setShowPotentialForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { success } = useToast()

  const ratingBg: Record<number, string> = {
    1: 'bg-[var(--danger-subtle)] text-[var(--danger)] border-red-200',
    2: 'bg-orange-50 text-orange-600 border-orange-200',
    3: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-amber-200',
    4: 'bg-[var(--primary-subtle)] text-[var(--primary)] border-blue-200',
    5: 'bg-[var(--success-subtle)] text-[var(--success)] border-green-200',
  }

  return (
    <>
      {/* Interactive Profile Header with 3x4 Photo & Edit Button */}
      <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4 sm:p-5 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* 3x4 Photo Box or Initial */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-[var(--radius-md)] bg-[var(--background-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[var(--foreground-muted)]">
                  {member.name.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">{member.name}</h1>
                <Badge variant={getStatusVariant(member.status)}>{getStatusLabel(member.status)}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                Stambuk {member.stambuk} · {member.class_name}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--foreground-muted)]">
                {member.daerah && <span>📍 {member.daerah}</span>}
                {member.rayon && <span>Rayon {member.rayon}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto"
            >
              <Edit2 size={14} />
              Edit Data
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="monitoring" onValueChange={setActiveTab}>
        <TabsList className="overflow-x-auto no-scrollbar">
          <TabsTrigger value="monitoring">
            <Brain size={14} className="mr-1.5" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="insya">
            <FileText size={14} className="mr-1.5" />
            Insya&apos;
          </TabsTrigger>
          <TabsTrigger value="potential">
            <Star size={14} className="mr-1.5" />
            Potensi Akademik
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock size={14} className="mr-1.5" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="ai">AI Insight</TabsTrigger>
        </TabsList>

        {/* MONITORING TAB */}
        <TabsContent value="monitoring">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Riwayat Monitoring ({monitoring.length})
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowMonitoringForm(true)}
            >
              <Plus size={14} />
              Tambah Monitoring
            </Button>
          </div>

          {monitoring.length === 0 ? (
            <EmptyState
              title="Belum ada monitoring"
              description="Tambahkan catatan monitoring untuk anggota ini."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowMonitoringForm(true)}>
                  <Plus size={14} />
                  Tambah Monitoring
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {monitoring.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center text-sm font-bold rounded-full border ${ratingBg[m.rating] ?? ''}`}
                      >
                        {m.rating}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{m.category}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatDate(m.observed_at)} · {getRatingLabel(m.rating)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {m.note && (
                    <p className="mt-2.5 text-sm text-[var(--foreground-secondary)] pl-11">{m.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* INSYA' TAB */}
        <TabsContent value="insya">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Catatan Insya&apos; ({insya.length})
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowInsyaForm(true)}
            >
              <Plus size={14} />
              Tambah Insya&apos;
            </Button>
          </div>

          {insya.length === 0 ? (
            <EmptyState
              title="Belum ada catatan insya'"
              description="Tambahkan catatan insya' untuk memantau perkembangan tulisan anggota."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowInsyaForm(true)}>
                  <Plus size={14} />
                  Tambah Insya&apos;
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {insya.map((i) => (
                <div
                  key={i.id}
                  className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {i.title ?? 'Tanpa Judul'}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        {formatDate(i.note_date)}
                        {i.kategori && ` · ${i.kategori}`}
                      </p>
                    </div>
                    {i.score !== null && (
                      <span className="text-sm font-semibold text-[var(--primary)]">
                        {i.score}
                      </span>
                    )}
                  </div>
                  {i.content && (
                    <p className="text-sm text-[var(--foreground-secondary)]">{i.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* POTENSI AKADEMIK TAB */}
        <TabsContent value="potential">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Potensi Akademik ({potential.length})
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPotentialForm(true)}
            >
              <Plus size={14} />
              Tambah Potensi
            </Button>
          </div>

          {potential.length === 0 ? (
            <EmptyState
              title="Belum ada catatan potensi akademik"
              description="Tambahkan catatan potensi untuk memantau perkembangan akademik anggota."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowPotentialForm(true)}>
                  <Plus size={14} />
                  Tambah Potensi
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {potential.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {p.bidang ?? 'Umum'}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)]">{formatDate(p.assessed_at)}</p>
                    </div>
                    {p.rating !== null && (
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center text-sm font-bold rounded-full border ${ratingBg[p.rating] ?? ''}`}
                      >
                        {p.rating}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {p.strength && (
                      <div>
                        <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">Kekuatan</span>
                        <p className="mt-0.5 text-[var(--foreground-secondary)]">{p.strength}</p>
                      </div>
                    )}
                    {p.potential && (
                      <div>
                        <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">Potensi</span>
                        <p className="mt-0.5 text-[var(--foreground-secondary)]">{p.potential}</p>
                      </div>
                    )}
                    {p.weakness && (
                      <div>
                        <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">Perlu Ditingkatkan</span>
                        <p className="mt-0.5 text-[var(--foreground-secondary)]">{p.weakness}</p>
                      </div>
                    )}
                    {p.recommendation && (
                      <div>
                        <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">Rekomendasi</span>
                        <p className="mt-0.5 text-[var(--foreground-secondary)]">{p.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Timeline Aktivitas</h2>
          {monitoring.length === 0 && insya.length === 0 && potential.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" description="Timeline akan muncul setelah ada monitoring, insya', atau catatan potensi." />
          ) : (
            <div className="space-y-3">
              {[
                ...monitoring.map((m) => ({
                  id: m.id,
                  date: m.observed_at,
                  type: 'monitoring' as const,
                  label: m.category,
                  detail: `Rating ${m.rating}/5 — ${getRatingLabel(m.rating)}`,
                  note: m.note,
                })),
                ...insya.map((i) => ({
                  id: i.id,
                  date: i.note_date,
                  type: 'insya' as const,
                  label: `Insya': ${i.title ?? 'Tanpa Judul'}`,
                  detail: i.score !== null ? `Nilai: ${i.score}` : null,
                  note: i.content,
                })),
                ...potential.map((p) => ({
                  id: p.id,
                  date: p.assessed_at,
                  type: 'potential' as const,
                  label: `Potensi: ${p.bidang ?? 'Umum'}`,
                  detail: p.rating !== null ? `Rating ${p.rating}/5` : null,
                  note: p.strength,
                })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex gap-4 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-8 w-8 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center">
                        {item.type === 'monitoring' && <Brain size={14} className="text-[var(--primary)]" />}
                        {item.type === 'insya' && <FileText size={14} className="text-[var(--foreground-muted)]" />}
                        {item.type === 'potential' && <Star size={14} className="text-[var(--warning)]" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                      {item.detail && (
                        <p className="text-xs text-[var(--primary)] font-medium">{item.detail}</p>
                      )}
                      <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{formatDate(item.date)}</p>
                      {item.note && (
                        <p className="mt-1.5 text-sm text-[var(--foreground-secondary)] line-clamp-2">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        {/* AI INSIGHT TAB */}
        <TabsContent value="ai">
          <AiInsightSection
            memberId={memberId}
            memberName={member.name}
            monitoring={monitoring}
            insya={insya}
            potential={potential}
          />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showMonitoringForm && (
        <MonitoringForm
          memberId={memberId}
          userId={userId}
          onClose={() => setShowMonitoringForm(false)}
          onSuccess={() => {
            setShowMonitoringForm(false)
            success('Monitoring berhasil disimpan.')
            window.location.reload()
          }}
        />
      )}
      {showInsyaForm && (
        <InsyaForm
          memberId={memberId}
          userId={userId}
          onClose={() => setShowInsyaForm(false)}
          onSuccess={() => {
            setShowInsyaForm(false)
            success("Catatan insya' berhasil disimpan.")
            window.location.reload()
          }}
        />
      )}
      {showPotentialForm && (
        <PotentialForm
          memberId={memberId}
          userId={userId}
          onClose={() => setShowPotentialForm(false)}
          onSuccess={() => {
            setShowPotentialForm(false)
            success('Potensi berhasil disimpan.')
            window.location.reload()
          }}
        />
      )}

      {showEditModal && (
        <EditMemberModal
          member={member}
          classId={classId}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
