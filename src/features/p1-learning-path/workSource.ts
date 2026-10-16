import sourceText from './source/Agent运行与架构模块_现有内容整合与验收稿.md?raw'
import layerGuideText from './source/Agent运行与架构模块_L3分层关系与模块覆盖边界.md?raw'

export type WorkTopic = { id: string; number: number; title: string; markdown: string; lead: string; secondLine: string }
export type WorkInterview = { id: string; number: number; title: string; markdown: string; sourceMarker: string; sourceDetail: string }

const source = sourceText.replace(/\r\n/g, '\n')
export const workSources = { content: sourceText, layerGuide: layerGuideText }

function stripInline(markdown: string) {
  return markdown.replace(/\*\*/g, '').replace(/`/g, '').trim()
}

function sourceRegion(start: string, end: string) {
  const first = source.indexOf(start)
  const last = source.indexOf(end, first + start.length)
  if (first < 0 || last < 0) throw new Error(`Work source section missing: ${start}`)
  return source.slice(first + start.length, last)
}

function headingSections(region: string) {
  const matches = [...region.matchAll(/^### (\d+)\. ([^\n]+)$/gm)]
  return matches.map((match, index) => ({
    number: Number(match[1]),
    title: match[2].trim(),
    markdown: region.slice(match.index! + match[0].length, matches[index + 1]?.index ?? region.length).trim(),
  }))
}

export const workTopics: WorkTopic[] = headingSections(sourceRegion('## L3｜功能具体怎样实现', '## L4｜项目面试实战'))
  .map(({ number, title, markdown }) => {
    const lines = markdown.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('|') && !line.startsWith('#'))
    return {
      id: `work-topic-${number}`,
      number,
      title,
      markdown,
      lead: stripInline(lines[0] ?? ''),
      secondLine: stripInline(lines.find((line, index) => index > 0 && !line.startsWith('-') && !/^\d+\./.test(line)) ?? lines[1] ?? ''),
    }
  })

const appendixB = sourceRegion('## 附录B｜面试来源与答案依据', '## 附录C｜来源定位与继承版本')

export const workInterviews: WorkInterview[] = headingSections(sourceRegion('## L4｜项目面试实战', '## 附录A｜知识怎样跨业务复用'))
  .map(({ number, title, markdown }) => {
    const sourceMarker = markdown.match(/〔(面\d+)〕/)?.[1] ?? ''
    const sourceDetail = appendixB.split('\n').find((line) => line.startsWith(`| ${sourceMarker} `)) ?? ''
    return { id: `work-interview-${number}`, number, title, markdown, sourceMarker, sourceDetail }
  })

export function topicByNumber(number: number) {
  return workTopics.find((topic) => topic.number === number) ?? null
}

export function interviewByNumber(number: number) {
  return workInterviews.find((question) => question.number === number) ?? null
}
