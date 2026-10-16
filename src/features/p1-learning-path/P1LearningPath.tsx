import { useLayoutEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AttachedKnowledgeCard } from '../s1-preview/AttachedKnowledgeCard.tsx'
import { S2DeepReadDialog } from '../s1-preview/S2DeepReadDialog.tsx'
import { queryActions, readerForWorkTopic } from './learningPathModel.ts'
import { interviewByNumber, topicByNumber } from './workSource.ts'
import './p1-learning-path.css'

type Layer = 'l1' | 'l2' | 'l3' | 'l4'
const interviewNumbers = [3, 4, 5, 6, 7, 8, 9]

function sourceCells(row: string) {
  return row.split('|').slice(1, -1).map((cell) => cell.trim())
}

export function P1LearningPath() {
  const [layer, setLayer] = useState<Layer>('l1')
  const [selectedActionId, setSelectedActionId] = useState(queryActions[0].id)
  const [mechanismId, setMechanismId] = useState<string | null>(null)
  const [technologyOpen, setTechnologyOpen] = useState(false)
  const [cardTopicNumber, setCardTopicNumber] = useState<number | null>(null)
  const [deepOpen, setDeepOpen] = useState(false)
  const [interviewNumber, setInterviewNumber] = useState(4)
  const [viewportWidth, setViewportWidth] = useState(typeof window === 'undefined' ? 1440 : window.innerWidth)
  const [viewportHeight, setViewportHeight] = useState(typeof window === 'undefined' ? 900 : window.innerHeight)
  const contentRef = useRef<HTMLElement>(null)
  const l3Scroll = useRef(0)
  const action = queryActions.find((item) => item.id === selectedActionId) ?? queryActions[0]
  const mechanism = action.mechanisms.find((item) => item.id === mechanismId) ?? null
  const cardTopic = cardTopicNumber === null ? null : topicByNumber(cardTopicNumber)
  const reader = cardTopicNumber === null ? null : readerForWorkTopic(cardTopicNumber)
  const interview = interviewByNumber(interviewNumber)

  useLayoutEffect(() => {
    const onResize = () => { setViewportWidth(window.innerWidth); setViewportHeight(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useLayoutEffect(() => {
    if (layer === 'l3' && contentRef.current) contentRef.current.scrollTop = l3Scroll.current
  }, [layer])

  const showLayer = (next: Layer) => {
    if (layer === 'l3') l3Scroll.current = contentRef.current?.scrollTop ?? 0
    setCardTopicNumber(null)
    setDeepOpen(false)
    setLayer(next)
  }

  const selectAction = (id: string) => {
    setSelectedActionId(id)
    setMechanismId(null)
    setTechnologyOpen(false)
    if (contentRef.current) contentRef.current.scrollTop = 0
    l3Scroll.current = 0
  }

  const selectMechanism = (id: string) => {
    setMechanismId((current) => current === id ? null : id)
    setTechnologyOpen(false)
  }

  const openCard = (number: number) => {
    setCardTopicNumber(number)
    setDeepOpen(false)
  }

  const cardTop = viewportWidth < 720 ? 48 : 84
  const cardPlacement = {
    side: 'left' as const,
    left: viewportWidth < 720 ? 12 : Math.max(16, viewportWidth - 468),
    top: cardTop,
    maxHeight: Math.max(280, viewportHeight - cardTop - 20),
  }

  return <div className="p1-path s1-preview" data-p1-learning-path>
    {layer === 'l1' ? <main className="p1-path__overview" aria-label="L1 系统总览">
      <div className="p1-path__overview-flow">
        <div>用户输入需求</div><span aria-hidden="true">→</span><div>Agent解决问题</div><span aria-hidden="true">→</span><div>输出结果</div>
      </div>
      <button type="button" onClick={() => showLayer('l2')}>查看功能 <span aria-hidden="true">→</span></button>
    </main> : <>
      <header className="p1-path__header">
        <div><span className="p1-path__brand">CRM</span><strong>客户分析能力学习路径</strong><small>独立 Sandbox · 交互验证</small></div>
        <nav aria-label="学习层级">
          <button type="button" onClick={() => showLayer('l1')}>L1 系统总览</button>
          <button type="button" className={layer === 'l2' ? 'is-active' : ''} onClick={() => showLayer('l2')}>L2 功能</button>
          <button type="button" className={layer === 'l3' ? 'is-active' : ''} onClick={() => showLayer('l3')}>L3 实现</button>
          <button type="button" className={layer === 'l4' ? 'is-active' : ''} onClick={() => showLayer('l4')}>L4 面试</button>
        </nav>
        <a href="?view=s1&p1=1">返回 P1 知识地图</a>
      </header>

      {layer === 'l2' && <main className="p1-path__layer p1-path__l2" aria-label="L2 功能">
        <div className="p1-path__section-head"><span>L2 · 功能</span><h1>从要完成的事进入</h1><p>“查询／生成”是这份 Work 内容的临时学习导航。</p></div>
        <div className="p1-path__feature-grid">
          <article><span>01 / 查询</span><h2>取得有权限的客户或业务数据</h2><p>线索、沟通记录、订单与商品都是这条查询路径可能涉及的对象。</p><div><button type="button" onClick={() => showLayer('l3')}>进入客户分析查询过程 →</button><button type="button" className="is-secondary" onClick={() => openCard(3)}>阅读查询知识卡</button></div></article>
          <article><span>02 / 生成</span><h2>根据事实形成客户分析</h2><p>客户分析与跟进建议沿用 Work 的完整正文；合同和月报资料同样保留在内容源中。</p><div><button type="button" onClick={() => openCard(9)}>阅读客户分析知识卡</button></div></article>
        </div>
        <button type="button" className="p1-path__quiet-link" onClick={() => showLayer('l4')}>查看查询链路相关面试题 →</button>
      </main>}

      {layer === 'l3' && <main className="p1-path__layer p1-path__l3" aria-label="L3 渐进式下钻">
        <div className="p1-path__section-head"><span>L3 · 客户分析中的查询</span><h1>沿当前动作逐层理解</h1><p>六个动作是本轮教学验证样本；澄清、补查与结束取决于任务，并非固定执行 Trace。</p></div>
        <div className="p1-path__l3-grid">
          <nav className="p1-path__action-list" aria-label="查询过程动作">
            {queryActions.map((item, index) => <button key={item.id} type="button" className={item.id === selectedActionId ? 'is-active' : ''} aria-current={item.id === selectedActionId ? 'step' : undefined} onClick={() => selectAction(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><i aria-hidden="true">›</i></button>)}
          </nav>
          <section className="p1-path__action-content" ref={contentRef} aria-live="polite">
            <div className="p1-path__action-head"><span>执行过程 · {String(queryActions.indexOf(action) + 1).padStart(2, '0')} / 06</span><h2>{action.title}</h2><p>{action.processNote}</p><button type="button" onClick={() => openCard(action.primaryTopicNumber)}>查看相关知识卡 ↗</button></div>
            <div className="p1-path__depth-label">支撑机制 <small>点击当前步骤相关问题</small></div>
            <div className="p1-path__mechanism-list">
              {action.mechanisms.map((item) => <button key={item.id} type="button" aria-expanded={mechanismId === item.id} className={mechanismId === item.id ? 'is-active' : ''} onClick={() => selectMechanism(item.id)}><span>{item.question}</span><i aria-hidden="true">{mechanismId === item.id ? '−' : '+'}</i></button>)}
            </div>
            {mechanism && <article className="p1-path__mechanism-detail">
              <span>支撑机制 · Work 主题 {mechanism.topicNumber}</span>
              <h3>{topicByNumber(mechanism.topicNumber)?.title}</h3>
              <p>{topicByNumber(mechanism.topicNumber)?.lead}</p>
              <div className="p1-path__inline-actions"><button type="button" onClick={() => setTechnologyOpen((value) => !value)} aria-expanded={technologyOpen}>{technologyOpen ? '收起具体技术' : '查看具体技术'} <span aria-hidden="true">{technologyOpen ? '−' : '+'}</span></button><button type="button" onClick={() => openCard(mechanism.topicNumber)}>打开同一知识卡 ↗</button></div>
              {technologyOpen && <div className="p1-path__technology"><span>具体技术与证据边界</span><h4>{mechanism.technology.title}</h4><p>{mechanism.technology.excerpt}</p><button type="button" onClick={() => openCard(mechanism.topicNumber)}>阅读 Work 完整正文 ↗</button></div>}
            </article>}
            <div className="p1-path__action-footer"><button type="button" disabled={queryActions.indexOf(action) === 0} onClick={() => selectAction(queryActions[queryActions.indexOf(action) - 1].id)}>← 上一个动作</button><button type="button" disabled={queryActions.indexOf(action) === queryActions.length - 1} onClick={() => selectAction(queryActions[queryActions.indexOf(action) + 1].id)}>下一个动作 →</button></div>
          </section>
        </div>
        <button type="button" className="p1-path__quiet-link" onClick={() => showLayer('l4')}>用相关面试题检验理解 →</button>
      </main>}

      {layer === 'l4' && <main className="p1-path__layer p1-path__l4" aria-label="L4 面试">
        <div className="p1-path__section-head"><span>L4 · 面试</span><h1>把查询链路讲清楚</h1><p>答案、记忆点、追问及来源继承 Work 原稿。回答个人贡献前仍需核实实际经历。</p></div>
        <div className="p1-path__interview-grid">
          <nav aria-label="面试问题">{interviewNumbers.map((number) => { const item = interviewByNumber(number)!; return <button type="button" key={item.id} className={number === interviewNumber ? 'is-active' : ''} onClick={() => setInterviewNumber(number)}><span>{item.sourceMarker}</span>{item.title}</button> })}</nav>
          <article className="p1-path__interview-content"><span>{interview?.sourceMarker} · Work 完整答案</span><h2>{interview?.title}</h2><div className="p1-path__markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{interview?.markdown ?? ''}</ReactMarkdown></div>{interview?.sourceDetail && <div className="p1-path__source"><strong>原题与答案依据</strong>{sourceCells(interview.sourceDetail).slice(1).map((cell, index) => <p key={index}>{cell}</p>)}</div>}</article>
        </div>
        <button type="button" className="p1-path__quiet-link" onClick={() => showLayer('l3')}>← 返回查询过程（保留上次动作）</button>
      </main>}
    </>}

    {cardTopic && <div className="p1-path__card-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setCardTopicNumber(null) }}>
      <AttachedKnowledgeCard
        code={`主题 ${cardTopic.number}`}
        name={cardTopic.title}
        domainLabel="Agent运行与架构"
        card={null}
        learned={false}
        placement={cardPlacement}
        onToggleLearned={() => undefined}
        onClose={() => { setCardTopicNumber(null); setDeepOpen(false) }}
        onOpenDeep={() => setDeepOpen(true)}
        experimentalModel={{ title: cardTopic.title, subtitle: '', learnable: false, preview: { definition: cardTopic.lead, mechanism: cardTopic.secondLine, boundaries: [] }, deepReadLabel: '阅读 Work 完整正文' }}
      />
    </div>}
    {deepOpen && reader && <S2DeepReadDialog reader={reader} onClose={() => setDeepOpen(false)} />}
  </div>
}
