import { content, sources } from '../../domain/content/content.ts'
import { buildDomainFocus, buildNodeFocus } from './contentFocusModel.ts'
import './content-focus.css'

type ContentFocusProps = {
  domainId: string
  nodeId?: string
  onSelectNode: (nodeId: string) => void
  onBackToDomain: () => void
  onExit: () => void
}

const sourceNames: Record<string, string> = {
  course: 'Course', project: 'Project', industry: 'Industry', inference: 'Inference',
  jd: 'JD', interview: 'Interview',
}

function KnowledgeCardSections({ nodeId }: { nodeId: string }) {
  const { node, card, evidence } = buildNodeFocus(content, sources, nodeId)

  if (!card) {
    return <section className="content-focus__empty" aria-label="Knowledge Card 状态">
      <h2>Knowledge Card 尚未建立</h2>
      <p>{node.name} 已在 canonical Node 清单中，当前没有可展示的 Knowledge Card；本轮不补写其正文。</p>
    </section>
  }

  return <div className="content-focus__sections">
    <section className="content-focus__section" aria-labelledby="definition-heading">
      <span className="content-focus__section-index">01</span><h2 id="definition-heading">一句话定义</h2>
      <p>{card.definition}</p>
    </section>
    <section className="content-focus__section" aria-labelledby="why-heading">
      <span className="content-focus__section-index">02</span><h2 id="why-heading">Why · 为什么重要</h2>
      <div className="content-focus__fact"><strong>课程事实</strong><p>{card.why.course}</p></div>
      <div className="content-focus__fact"><strong>产品／项目价值</strong><p>{card.why.project}</p></div>
      {card.why.industry && <div className="content-focus__fact"><strong>行业补充</strong><p>{card.why.industry}</p></div>}
    </section>
    <section className="content-focus__section" aria-labelledby="mechanism-heading">
      <span className="content-focus__section-index">03</span><h2 id="mechanism-heading">原理 → 项目落地</h2>
      <div className="content-focus__fact"><strong>原理</strong><p>{card.mechanism}</p></div>
      <div className="content-focus__fact"><strong>项目落地</strong><p>{card.projectUsage}</p></div>
    </section>
    <section className="content-focus__section" aria-labelledby="boundaries-heading">
      <span className="content-focus__section-index">04</span><h2 id="boundaries-heading">关键边界／易混淆点</h2>
      <div className="content-focus__stack">{card.boundaries.map((boundary) => <article key={boundary.title} className="content-focus__fact">
        <div className="content-focus__fact-heading"><strong>{boundary.title}</strong><small>{boundary.status}</small></div>
        <p>{boundary.summary}</p>
      </article>)}</div>
    </section>
    <section className="content-focus__section" aria-labelledby="case-heading">
      <span className="content-focus__section-index">05</span><h2 id="case-heading">Case</h2>
      <p>{card.caseSummary}</p>
    </section>
    <section className="content-focus__section" aria-labelledby="interview-heading">
      <span className="content-focus__section-index">06</span><h2 id="interview-heading">Interview Lens</h2>
      <div className="content-focus__stack">{card.interviewLens.map((lens, index) => <article key={lens.question} className="content-focus__fact">
        <strong>Q{index + 1} · {lens.question}</strong><p>{lens.answerFocus}</p>
      </article>)}</div>
    </section>
    <section className="content-focus__section" aria-labelledby="evidence-heading">
      <span className="content-focus__section-index">07</span><h2 id="evidence-heading">Evidence</h2>
      <div className="content-focus__stack">{evidence.map(({ reference, source }) => <article key={source.fragmentId} className="content-focus__evidence">
        <div className="content-focus__fact-heading"><strong>{source.title}</strong><small>{sourceNames[source.sourceType] ?? source.sourceType}</small></div>
        <p>{source.text}</p><code>{source.location}</code>
        {(reference.note || source.notes) && <small>{reference.note ?? source.notes}</small>}
      </article>)}</div>
    </section>
  </div>
}

export function ContentFocus({ domainId, nodeId, onSelectNode, onBackToDomain, onExit }: ContentFocusProps) {
  const { domain, nodes } = buildDomainFocus(content, domainId)
  const selected = nodeId ? buildNodeFocus(content, sources, nodeId) : undefined

  return <main className="content-focus" aria-label={nodeId ? 'S2 Node Focus' : 'S1 Domain Focus'}>
    <div className="content-focus__container">
      <div className="content-focus__toolbar">
        <span className="content-focus__eyebrow">SYSTEM ATLAS / {nodeId ? 'S2 NODE FOCUS' : 'S1 DOMAIN FOCUS'}</span>
        <button type="button" onClick={nodeId ? onBackToDomain : onExit}>
          ← {nodeId ? '返回 Domain Focus' : '返回 System Atlas'}
        </button>
      </div>
      <header className="content-focus__intro">
        <div><span className="content-focus__code">{nodeId ? 'S2' : 'S1'}</span>
          <h1>{selected ? selected.node.name : domain.name}</h1>
          <p>{selected ? selected.node.summary : domain.description}</p>
        </div>
        {selected && <div className="content-focus__status"><span>{selected.node.weight ?? '未标权重'}</span><span>{selected.card?.reviewStatus ?? 'No Card'}</span></div>}
      </header>
      {nodeId ? <KnowledgeCardSections nodeId={nodeId} /> : <>
        <div className="content-focus__list-head"><h2>Canonical Nodes</h2><span>当前可用 {nodes.length} 项</span></div>
        <div className="content-focus__node-list">{nodes.map(({ node, card }) => <button key={node.id} type="button" onClick={() => onSelectNode(node.id)} className="content-focus__node">
          <div><span className="content-focus__node-code">{node.slug.slice(0, 3).toUpperCase()}</span><h3>{node.name}</h3></div>
          <p>{node.summary}</p>
          <div className="content-focus__node-meta"><span>{node.weight ?? '未标权重'}</span><span>{card ? 'Knowledge Card' : 'No Card'}</span><span>{card?.reviewStatus ?? '—'}</span></div>
        </button>)}</div>
      </>}
      <div className="content-focus__end-nav">
        {nodeId && <button type="button" onClick={onBackToDomain}>返回 S1</button>}
        <button type="button" onClick={onExit}>返回 System Atlas</button>
      </div>
    </div>
  </main>
}
