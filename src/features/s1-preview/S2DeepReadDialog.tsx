import { useEffect, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { KnowledgeCard } from '../../domain/content/schema.ts'
import type { P1ReaderModel } from '../p1-integration/p1KnowledgeModel.ts'
import { validateH02Text, type H02Text } from './h02Edits.ts'
import { nextS2Section, previousS2Section, S2_SECTIONS, type S2SectionId } from './s2Sections.ts'
import './s2-deep-read.css'

type LegacyProps = {
  card: KnowledgeCard
  text: H02Text
  onClose: () => void
  onSave: (text: H02Text) => string | null
  onExport: () => void
}

type ExperimentalProps = { reader: P1ReaderModel; onClose: () => void }
type Props = LegacyProps | ExperimentalProps

const FLOW_STEPS = [
  { title: '信息来源', detail: '系统规则 / 历史消息 / 工具定义 / Skill / Memory' },
  { title: '选择 / 裁剪 / 排序', detail: '基于当前任务筛选、压缩并组织' },
  { title: 'Runtime Context', detail: '形成模型这一轮实际可见的信息' },
  { title: 'Model API', detail: '将组装后的 Context 注入模型' },
]

export function S2DeepReadDialog(props: Props) {
  return 'reader' in props
    ? <ExperimentalReader reader={props.reader} onClose={props.onClose} />
    : <LegacyReader {...props} />
}

function ExperimentalReader({ reader, onClose }: ExperimentalProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const section = reader.sections[activeIndex]
  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  const select = (index: number) => {
    setActiveIndex(index)
    readingRef.current?.scrollTo({ top: 0 })
  }
  if (!section) return null
  return <div className="s2-deep-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="s2-deep-dialog" role="dialog" aria-modal="true" aria-label={`${reader.code} 知识阅读`}>
      <header className="s2-deep-header">
        <div className="s2-deep-heading"><span>{reader.code} · P1 隔离验证</span><h2>{reader.title} <small>{reader.subtitle}</small></h2></div>
        <div className="s2-deep-actions"><button type="button" className="s2-deep-icon" ref={closeRef} onClick={onClose} aria-label="关闭深读弹窗">×</button></div>
      </header>
      <div className="s2-reader-layout">
        <nav className="s2-reader-nav" role="tablist" aria-label={`${reader.code} 知识维度`}>
          {reader.sections.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={index === activeIndex} onClick={() => select(index)}><span>{index + 1}</span><strong>{item.label}</strong><i aria-hidden="true">›</i></button>)}
        </nav>
        <main className="s2-reader-detail">
          <header className="s2-reader-detail-head"><span>{reader.code} · {section.label}</span><h2>{section.title}</h2></header>
          <div className="s2-reader-scroll" ref={readingRef} role="tabpanel" aria-label={section.label}>
            {section.markdown
              ? <div className="s2-reader-work-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{section.markdown}</ReactMarkdown></div>
              : <>
                <div className="s2-reader-callout"><p>{section.body}</p></div>
                {section.flow && <div className="s2-reader-flow" aria-label={`${reader.code} 流程图`}>{section.flow.map((step, index) => <div className="s2-reader-flow-unit" key={step}><div className="s2-reader-flow-card"><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>{index < section.flow!.length - 1 && <i aria-hidden="true">→</i>}</div>)}</div>}
                {section.bullets && <div className="s2-reader-boundaries">{section.bullets.map((item) => <article key={item}><span aria-hidden="true">✓</span><div><p>{item}</p></div></article>)}</div>}
              </>}
          </div>
          <footer className="s2-reader-pagination">
            <button type="button" disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)}>‹ <span>上一节</span></button>
            <strong>{activeIndex + 1} / {reader.sections.length}</strong>
            <button type="button" disabled={activeIndex === reader.sections.length - 1} onClick={() => select(activeIndex + 1)}><span>下一节</span> ›</button>
          </footer>
        </main>
      </div>
    </article>
  </div>
}

function LegacyReader({ card, text, onClose, onSave, onExport }: LegacyProps) {
  const [activeSection, setActiveSection] = useState<S2SectionId>('definition')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<H02Text>(text)
  const [error, setError] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const shown = editing ? draft : text
  const activeIndex = S2_SECTIONS.findIndex(({ id }) => id === activeSection)
  const section = S2_SECTIONS[activeIndex]!

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const selectSection = (next: S2SectionId) => {
    setActiveSection(next)
    readingRef.current?.scrollTo({ top: 0 })
  }
  const beginEdit = () => {
    setDraft(structuredClone(text))
    setError(null)
    setEditing(true)
  }
  const saveEdit = () => {
    const failure = validateH02Text(draft, card) ?? onSave(draft)
    if (failure) { setError(failure); return }
    setEditing(false)
    setError(null)
  }
  const cancelEdit = () => { setDraft(text); setEditing(false); setError(null) }
  const field = (label: string, value: string, update: (next: string) => void, rows = 5) =>
    editing
      ? <textarea aria-label={label} value={value} rows={rows} maxLength={2000} onChange={(event) => update(event.target.value)} />
      : <p>{value}</p>

  const renderSection = (): ReactNode => {
    switch (activeSection) {
      case 'definition':
        return <div className="s2-reader-definition">
          <div className="s2-reader-callout">{field('编辑一句话定义', shown.definition, (next) => setDraft((current) => ({ ...current, definition: next })), 7)}</div>
          <div className="s2-reader-terms" aria-label="定义中的核心术语"><span>Harness</span><span>运行时 Context</span><span>每轮决策前</span></div>
        </div>
      case 'boundaries':
        return <div className="s2-reader-boundaries">{shown.boundaries.map((boundary, index) => <article key={card.boundaries[index]?.title ?? index}>
          <span aria-hidden="true">✓</span><div>
            {editing ? <input aria-label={`编辑边界 ${index + 1} 标题`} value={boundary.title} maxLength={120} onChange={(event) => setDraft((current) => ({ ...current, boundaries: current.boundaries.map((item, position) => position === index ? { ...item, title: event.target.value } : item) }))} /> : <h3>{boundary.title}</h3>}
            {field(`编辑边界 ${index + 1} 说明`, boundary.summary, (next) => setDraft((current) => ({ ...current, boundaries: current.boundaries.map((item, position) => position === index ? { ...item, summary: next } : item) })), 3)}
          </div>
        </article>)}</div>
      case 'why':
        return <div className="s2-reader-two-column">
          <article><span>01 · 课程视角</span><h3>模型为什么需要正确的 Context？</h3>{field('编辑 Why 课程视角', shown.whyCourse, (next) => setDraft((current) => ({ ...current, whyCourse: next })), 6)}</article>
          <article><span>02 · 项目视角</span><h3>管理不当会发生什么？</h3>{field('编辑 Why 项目视角', shown.whyProject, (next) => setDraft((current) => ({ ...current, whyProject: next })), 6)}</article>
        </div>
      case 'project':
        return <div className="s2-reader-project">
          <section className="s2-reader-mechanism">
            <span className="s2-reader-kicker">01 · 原理</span>
            <div className="s2-reader-prose">{field('编辑运行机制', shown.mechanism, (next) => setDraft((current) => ({ ...current, mechanism: next })), 8)}</div>
            {!editing && <div className="s2-reader-flow" aria-label="Context Assembly 流程图">{FLOW_STEPS.map((step, index) => <div className="s2-reader-flow-unit" key={step.title}>
              <div className="s2-reader-flow-card"><span>{String(index + 1).padStart(2, '0')}</span><strong>{step.title}</strong><small>{step.detail}</small></div>
              {index < FLOW_STEPS.length - 1 && <i aria-hidden="true">→</i>}
            </div>)}</div>}
          </section>
          <span className="s2-reader-kicker">02 · 项目落地</span>
          <div className="s2-reader-project-label"><span>CRM</span><div><strong>云帆 CRM Agent</strong><small>真实项目落地</small></div></div>
          <div className="s2-reader-prose">{field('编辑项目落地', shown.projectUsage, (next) => setDraft((current) => ({ ...current, projectUsage: next })), 10)}</div>
          {!editing && <div className="s2-reader-project-grid"><span>全局 System Prompt</span><span>多会话与历史持久化</span><span>长期 Memory</span><span>Context 用量显示</span><span>模型上下文上限</span><span>附件输入</span></div>}
        </div>
      case 'case':
        return <div className="s2-reader-case">
          <span className="s2-reader-kicker">CRM 客户跟进场景</span>
          <h3>从用户请求到模型决策前</h3>
          <div className="s2-reader-case-body">{field('编辑 Case', shown.caseSummary, (next) => setDraft((current) => ({ ...current, caseSummary: next })), 11)}</div>
          {!editing && <div className="s2-reader-case-boundary"><strong>本节终点</strong><span>Context 组装完成，随后才进入 H03 Model Decision；这里不解释 Tool 如何执行。</span></div>}
        </div>
      case 'interview':
        return <div className="s2-reader-interview">{shown.interviewLens.map((item, index) => <article key={card.interviewLens[index]?.question ?? index}>
          <span>Q{String(index + 1).padStart(2, '0')}</span><div>
            {editing ? <input aria-label={`编辑面试问题 ${index + 1}`} value={item.question} maxLength={300} onChange={(event) => setDraft((current) => ({ ...current, interviewLens: current.interviewLens.map((entry, position) => position === index ? { ...entry, question: event.target.value } : entry) }))} /> : <h3>{item.question}</h3>}
            {field(`编辑面试回答 ${index + 1}`, item.answerFocus, (next) => setDraft((current) => ({ ...current, interviewLens: current.interviewLens.map((entry, position) => position === index ? { ...entry, answerFocus: next } : entry) })), 5)}
          </div>
        </article>)}</div>
      case 'evidence':
        return <div className="s2-reader-evidence">{card.evidenceRefs.map((reference, index) => <article key={reference.sourceFragmentId}>
          <span>{reference.sourceLayer}</span><code>{reference.sourceFragmentId}</code>
          {editing ? <textarea aria-label={`编辑证据备注 ${index + 1}`} value={shown.evidenceNotes[index] ?? ''} rows={3} maxLength={500} placeholder="可补充阅读备注，不修改来源引用" onChange={(event) => setDraft((current) => ({ ...current, evidenceNotes: current.evidenceNotes.map((note, position) => position === index ? event.target.value : note) }))} /> : shown.evidenceNotes[index] && <p>{shown.evidenceNotes[index]}</p>}
        </article>)}</div>
    }
  }

  return <div className="s2-deep-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <article className="s2-deep-dialog" role="dialog" aria-modal="true" aria-label="H02 完整知识卡">
      <header className="s2-deep-header">
        <div className="s2-deep-heading"><span>H02 · Agent Runtime / Harness</span><h2>Context Assembly <small>上下文组装</small></h2></div>
        <div className="s2-deep-actions">
          <button type="button" onClick={onExport} aria-label="导出修改 JSON" title="将本机保存的 H02 修改导出为 JSON">导出 JSON</button>
          {!editing && <button type="button" className="s2-deep-icon" onClick={beginEdit} aria-label="编辑完整正文" title="编辑当前知识正文">✎</button>}
          <button type="button" className="s2-deep-icon" ref={closeRef} onClick={onClose} aria-label="关闭深读弹窗">×</button>
        </div>
      </header>
      <div className="s2-reader-layout">
        <nav className="s2-reader-nav" role="tablist" aria-label="H02 知识维度">
          {S2_SECTIONS.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={activeSection === item.id} aria-controls="s2-current-section" onClick={() => selectSection(item.id)}><span>{index + 1}</span><strong>{item.label}</strong><i aria-hidden="true">›</i></button>)}
        </nav>
        <main className="s2-reader-detail">
          <header className="s2-reader-detail-head"><span>H02 · {section.label}</span><h2>{section.title}</h2></header>
          <div className="s2-reader-scroll" ref={readingRef} id="s2-current-section" role="tabpanel" aria-label={section.label}>{renderSection()}</div>
          <footer className="s2-reader-pagination">
            <button type="button" disabled={activeIndex === 0} onClick={() => selectSection(previousS2Section(activeSection))}>‹ <span>上一节</span></button>
            <strong>{activeIndex + 1} / {S2_SECTIONS.length}</strong>
            <button type="button" disabled={activeIndex === S2_SECTIONS.length - 1} onClick={() => selectSection(nextS2Section(activeSection))}><span>下一节</span> ›</button>
          </footer>
        </main>
      </div>
      {editing && <footer className="s2-deep-edit-footer">{error && <span role="alert">{error}</span>}<small>当前编辑会覆盖本机保存的 H02 正文</small><button type="button" onClick={cancelEdit}>取消</button><button type="button" onClick={saveEdit}>保存正文</button></footer>}
    </article>
  </div>
}
