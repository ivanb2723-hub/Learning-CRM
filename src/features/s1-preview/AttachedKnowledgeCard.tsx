import { useState, type Ref } from 'react'
import type { KnowledgeCard } from '../../domain/content/schema.ts'
import type { H02Text } from './h02Edits.ts'
import { cardPreview } from './s1CardModel.ts'
import type { CardPlacement } from './s1FocusGeometry.ts'
import './attached-knowledge-card.css'

type Props = {
  code: string
  name: string
  domainLabel: string
  card: KnowledgeCard | null
  learned: boolean
  placement: CardPlacement
  onToggleLearned: () => void
  onClose: () => void
  previewText?: H02Text['preview']
  onSavePreview?: (preview: H02Text['preview']) => string | null
  onOpenDeep?: () => void
  cardRef?: Ref<HTMLElement>
  experimentalModel?: {
    title: string
    subtitle: string
    learnable: boolean
    preview?: { definition: string; mechanism: string; boundaries: string[] }
    deepReadLabel?: string
  }
}

export function AttachedKnowledgeCard({ code, name, domainLabel, card, learned, placement, onToggleLearned, onClose, previewText, onSavePreview, onOpenDeep, cardRef, experimentalModel }: Props) {
  const cardBasedPreview = card ? { ...cardPreview(card), ...previewText } : null
  const preview = experimentalModel?.preview ?? cardBasedPreview
  const boundaries = experimentalModel?.preview?.boundaries ?? cardBasedPreview?.boundaries.map(({ title }) => title) ?? []
  const learnable = experimentalModel ? experimentalModel.learnable : Boolean(card)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<H02Text['preview'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const chineseName = name.match(/（([^）]+)）/)?.[1]
  const title = experimentalModel?.title ?? card?.title.replace(new RegExp(`^${code}\\s*`, 'i'), '') ?? name.replace(/（.*）$/, '')

  const beginEdit = () => {
    if (!preview) return
    setDraft({ definition: preview.definition, mechanism: preview.mechanism })
    setError(null)
    setEditing(true)
  }
  const saveEdit = () => {
    if (!draft || !onSavePreview) return
    const next = { definition: draft.definition.trim(), mechanism: draft.mechanism.trim() }
    if (!next.definition || !next.mechanism) { setError('首屏摘要不能留空。'); return }
    const failure = onSavePreview(next)
    if (failure) { setError(failure); return }
    setEditing(false)
    setDraft(null)
  }

  return <aside
    ref={cardRef}
    className={`s1-attached-card s1-attached-card--${placement.side}`}
    data-s1-attached-card
    style={{ left: placement.left, top: placement.top, maxHeight: placement.maxHeight }}
    aria-label={`${code} 附着式知识卡`}
  >
    <header className="s1-attached-card__header">
      <div className="s1-attached-card__heading">
        <span className="s1-attached-card__eyebrow">{code} · {domainLabel}</span>
        <h2>{title}</h2>
        {chineseName && <p>{chineseName}</p>}
      </div>
      <div className="s1-attached-card__header-actions">
        {card && onSavePreview && <button type="button" className="s1-attached-card__edit" onClick={beginEdit} aria-label="编辑首屏摘要" title="编辑首屏摘要">✎</button>}
        {learnable && <button type="button" className={`s1-attached-card__learn${learned ? ' is-learned' : ''}`} onClick={onToggleLearned} aria-label={learned ? '取消学习打卡' : '标记学习完成'} aria-pressed={learned} title={learned ? '取消学习打卡' : '学习打卡'}><span aria-hidden="true">{learned ? '✓' : ''}</span></button>}
        <button type="button" className="s1-attached-card__close" onClick={onClose} aria-label="关闭知识卡">×</button>
      </div>
    </header>
    {preview ? <>
      <div className="s1-attached-card__body">
        <section className="s1-attached-card__section">
          <h3>一句话定义</h3>
          {editing ? <textarea aria-label="编辑首屏一句话定义" value={draft?.definition ?? ''} maxLength={500} onChange={(event) => setDraft((current) => current && { ...current, definition: event.target.value })} /> : <p>{preview.definition}</p>}
        </section>
        <section className="s1-attached-card__section">
          <h3>核心机制</h3>
          {editing ? <textarea aria-label="编辑首屏核心机制" value={draft?.mechanism ?? ''} maxLength={500} onChange={(event) => setDraft((current) => current && { ...current, mechanism: event.target.value })} /> : <p className="s1-attached-card__mechanism">{preview.mechanism}</p>}
        </section>
        {boundaries.length > 0 && <section className="s1-attached-card__section">
          <h3>关键边界</h3>
          <ul className="s1-attached-card__boundaries">{boundaries.map((boundary) => <li key={boundary}><span aria-hidden="true">✓</span>{boundary}</li>)}</ul>
        </section>}
        {editing && <div className="s1-attached-card__edit-actions">{error && <p role="alert">{error}</p>}<button type="button" onClick={() => { setEditing(false); setDraft(null); setError(null) }}>取消</button><button type="button" onClick={saveEdit}>保存摘要</button></div>}
      </div>
      {card && <footer className="s1-attached-card__footer"><button type="button" disabled={!onOpenDeep || editing} onClick={onOpenDeep} aria-label={onOpenDeep ? '继续阅读完整七字段' : '继续阅读完整七字段，即将开放'}>继续阅读完整七字段 {!onOpenDeep && <span>即将开放</span>}<i aria-hidden="true">↗</i></button></footer>}
      {experimentalModel?.deepReadLabel && <footer className="s1-attached-card__footer"><button type="button" disabled={!onOpenDeep} onClick={onOpenDeep} aria-label={experimentalModel.deepReadLabel}>{experimentalModel.deepReadLabel}<i aria-hidden="true">↗</i></button></footer>}
    </> : <div className="s1-attached-card__pending">内容待补充</div>}
  </aside>
}
