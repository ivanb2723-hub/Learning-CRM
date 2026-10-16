import { describe, expect, it } from 'vitest'
import { interviewByNumber, topicByNumber, workInterviews, workSources, workTopics } from './workSource.ts'

describe('preserved Work source', () => {
  it('exposes each of the twelve complete L3 topics from one source', () => {
    expect(workTopics.map((topic) => topic.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(topicByNumber(3)?.markdown).toContain('Python 工具把请求送到 Next.js 的工具接口')
    expect(topicByNumber(10)?.markdown).toContain('#### 合同：重点是按模板准确填数据')
    expect(topicByNumber(10)?.markdown).toContain('#### 月报：重点是统计口径和报告解释')
    expect(workSources.layerGuide).toContain('功能包含处理过程；过程使用机制；代码和框架实现机制')
  })

  it('keeps full interview answers, memory points, follow-ups and source rows', () => {
    expect(workInterviews).toHaveLength(11)
    const question = interviewByNumber(4)!
    expect(question.markdown).toContain('Tool 调原有 CRM 服务')
    expect(question.markdown).toContain('记住：')
    expect(question.markdown).toContain('追问：')
    expect(question.sourceMarker).toBe('面4')
    expect(question.sourceDetail).toContain('工程1')
  })
})
