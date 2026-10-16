import { describe, expect, it } from 'vitest'
import { queryActions, readerForWorkTopic } from './learningPathModel.ts'
import { topicByNumber } from './workSource.ts'

describe('customer analysis query probe', () => {
  it('has six selected actions and local drill-down at every action', () => {
    expect(queryActions.map((action) => action.title)).toEqual([
      '确定查询对象', '提出 CRM 查询', 'Tool 执行', 'CRM 权限与 Service', '结果回传', '继续查询或结束',
    ])
    expect(queryActions.every((action) => action.mechanisms.length > 0)).toBe(true)
    for (const action of queryActions) {
      expect(topicByNumber(action.primaryTopicNumber)).not.toBeNull()
      for (const mechanism of action.mechanisms) {
        expect(topicByNumber(mechanism.topicNumber)).not.toBeNull()
        expect(mechanism.technology.excerpt.length).toBeGreaterThan(20)
      }
    }
  })

  it('resolves repeated topic references to the same Work body', () => {
    expect(queryActions.filter((action) => action.primaryTopicNumber === 3)).toHaveLength(2)
    expect(readerForWorkTopic(3)?.sections[0].markdown).toBe(topicByNumber(3)?.markdown)
    expect(readerForWorkTopic(10)?.sections[0].markdown).toContain('#### 月报：重点是统计口径和报告解释')
  })
})
