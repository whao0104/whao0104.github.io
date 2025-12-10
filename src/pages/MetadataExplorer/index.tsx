import { useState, useRef, useEffect } from 'react'
import { Input, Button, Card, Steps, message, Tag, Spin, Space } from 'antd'
import {
  SendOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  ChromeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ApiOutlined,
  BulbOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import styles from './index.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ExplorerData {
  entity: string
  type: 'table' | 'metric' | 'dashboard'
  description: string
  details: {
    owner: string
    updateTime: string
    tags: string[]
  }
  structure?: any
  lineage?: any
}

const MetadataExplorer = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 划词解读状态
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [tooltipResult, setTooltipResult] = useState<ExplorerData | null>(null)
  const [tooltipLoading, setTooltipLoading] = useState(false)
  const demoTextRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 处理文本选择 - 只有选中高亮实体文本时才显示按钮
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()

      // 只有在没有显示结果弹窗时才处理选中事件
      if (tooltipResult) return

      // 检查是否有选中的文本
      if (!text || text.length === 0) {
        // 没有选中文本，隐藏按钮
        setShowTooltip(false)
        setSelectedText('')
        return
      }

      // 检查选中的文本是否在演示区域内的高亮实体元素中
      if (demoTextRef.current && selection?.rangeCount && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const container = range.commonAncestorContainer
        
        // 获取包含选中文本的父元素
        let parentElement = container.nodeType === 3 ? container.parentNode : container
        
        // 向上查找，检查是否在 .entity 类的元素内
        let isInsideEntityElement = false
        let currentElement = parentElement as HTMLElement | null
        
        while (currentElement && demoTextRef.current.contains(currentElement)) {
          if (currentElement.classList && currentElement.classList.contains(styles.entity)) {
            isInsideEntityElement = true
            break
          }
          currentElement = currentElement.parentElement
        }
        
        if (isInsideEntityElement) {
          // 在高亮实体元素内选中了文本，显示按钮
          const rect = range.getBoundingClientRect()
          setSelectedText(text)
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          })
          setShowTooltip(true)
        } else {
          // 选中的文本不在高亮实体内，隐藏按钮
          setShowTooltip(false)
          setSelectedText('')
        }
      } else {
        // 无法获取选区信息，隐藏按钮
        setShowTooltip(false)
        setSelectedText('')
      }
    }

    // 监听选中状态变化
    document.addEventListener('selectionchange', handleSelection)
    
    // 监听鼠标抬起事件（更及时地响应选中操作）
    document.addEventListener('mouseup', handleSelection)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelection)
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [tooltipResult])

  // 点击其他区域关闭弹窗和按钮
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // 点击弹窗外和按钮外的区域才关闭
      if (!target.closest(`.${styles.tooltipButton}`) && !target.closest(`.${styles.tooltipPopup}`)) {
        setShowTooltip(false)
        setTooltipResult(null)
        setSelectedText('')
        // 清除选中状态
        window.getSelection()?.removeAllRanges()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  // 监听键盘ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(false)
        setTooltipResult(null)
        setSelectedText('')
        window.getSelection()?.removeAllRanges()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 模拟元数据解读
  const parseEntity = async (query: string): Promise<ExplorerData | null> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    const lowerQuery = query.toLowerCase()

    // 精确匹配实体
    // 数据表实体
    if (lowerQuery.includes('dw.user_behavior_log') || lowerQuery.includes('用户行为')) {
      return {
        entity: 'dw.user_behavior_log',
        type: 'table',
        description: '该表记录了用户的行为日志数据，包括访问、点击、购买、分享等行为事件，是用户行为分析的基础数据表',
        details: {
          owner: '数据平台组',
          updateTime: '2024-12-10 09:30:00',
          tags: ['用户行为', '核心表', '天级更新'],
        },
        structure: {
          fields: [
            { name: 'user_id', type: 'BIGINT', comment: '用户ID' },
            { name: 'event_type', type: 'VARCHAR', comment: '事件类型' },
            { name: 'event_time', type: 'TIMESTAMP', comment: '事件时间' },
            { name: 'page_url', type: 'VARCHAR', comment: '页面URL' },
            { name: 'session_id', type: 'VARCHAR', comment: '会话ID' },
          ],
          partitions: ['dt: 日期分区'],
        },
        lineage: {
          upstream: ['ods.user_log', 'ods.click_stream'],
          downstream: ['ads.user_portrait', 'ads.conversion_funnel', 'dws.user_daily_summary'],
        },
      }
    }

    if (lowerQuery.includes('dw.order_detail') || (lowerQuery.includes('订单') && lowerQuery.includes('表'))) {
      return {
        entity: 'dw.order_detail',
        type: 'table',
        description: '订单明细表，记录每笔订单的详细信息，包括订单金额、商品信息、支付方式等，是交易分析的核心数据表',
        details: {
          owner: '交易数据组',
          updateTime: '2024-12-10 10:15:00',
          tags: ['交易订单', '核心表', '实时更新'],
        },
        structure: {
          fields: [
            { name: 'order_id', type: 'BIGINT', comment: '订单ID' },
            { name: 'user_id', type: 'BIGINT', comment: '用户ID' },
            { name: 'product_id', type: 'BIGINT', comment: '商品ID' },
            { name: 'order_amount', type: 'DECIMAL', comment: '订单金额' },
            { name: 'payment_method', type: 'VARCHAR', comment: '支付方式' },
            { name: 'order_status', type: 'VARCHAR', comment: '订单状态' },
            { name: 'created_time', type: 'TIMESTAMP', comment: '创建时间' },
          ],
          partitions: ['dt: 日期分区', 'region: 地区分区'],
        },
        lineage: {
          upstream: ['ods.order_info', 'ods.payment_log'],
          downstream: ['ads.gmv_report', 'ads.product_sales_rank', 'dws.user_purchase_summary'],
        },
      }
    }

    // 业务指标实体
    if (lowerQuery.includes('日活跃用户数') || lowerQuery.includes('dau')) {
      return {
        entity: '日活跃用户数(DAU)',
        type: 'metric',
        description: '统计每日活跃用户数量，定义为当日至少有一次有效行为的独立用户数，是衡量产品活跃度的核心指标',
        details: {
          owner: '产品分析组',
          updateTime: '2024-12-10 08:00:00',
          tags: ['核心指标', '日更新', '产品分析'],
        },
        structure: {
          formula: 'COUNT(DISTINCT user_id)',
          dimensions: ['日期', '平台', '渠道', '用户类型'],
          dataSource: 'dw.user_behavior_log',
        },
        lineage: {
          upstream: ['dw.user_behavior_log', 'dim.user_info'],
          downstream: ['运营日报看板', '产品分析报表', '高管日报'],
        },
      }
    }

    if (lowerQuery.includes('月活跃用户数') || lowerQuery.includes('mau')) {
      return {
        entity: '月活跃用户数(MAU)',
        type: 'metric',
        description: '统计最近30天内有过活跃行为的独立用户数，反映产品的用户规模和增长趋势，是重要的月度考核指标',
        details: {
          owner: '产品分析组',
          updateTime: '2024-12-10 08:00:00',
          tags: ['核心指标', '日更新', '月度考核'],
        },
        structure: {
          formula: 'COUNT(DISTINCT user_id) WHERE event_time >= DATE_SUB(CURRENT_DATE, 30)',
          dimensions: ['日期', '平台', '渠道', '用户等级'],
          dataSource: 'dw.user_behavior_log',
        },
        lineage: {
          upstream: ['dw.user_behavior_log', 'dim.user_info', 'dim.user_level'],
          downstream: ['运营月报看板', '增长分析报表', 'CEO看板'],
        },
      }
    }

    if (lowerQuery.includes('用户留存率') || lowerQuery.includes('留存')) {
      return {
        entity: '用户留存率',
        type: 'metric',
        description: '衡量新用户在注册后的持续活跃情况，包括次日留存、7日留存、30日留存等，是评估产品粘性和用户质量的关键指标',
        details: {
          owner: '增长分析组',
          updateTime: '2024-12-10 08:30:00',
          tags: ['核心指标', '日更新', '增长分析'],
        },
        structure: {
          formula: 'COUNT(DISTINCT retained_users) / COUNT(DISTINCT new_users) * 100%',
          dimensions: ['注册日期', '留存天数', '渠道', '用户类型'],
          dataSource: 'dws.user_retention_detail',
        },
        lineage: {
          upstream: ['dw.user_behavior_log', 'dim.user_info', 'dws.user_daily_summary'],
          downstream: ['增长分析看板', '渠道效果评估', '产品优化报表'],
        },
      }
    }

    // 数据看板实体
    if (lowerQuery.includes('营销运营监控看板') || (lowerQuery.includes('营销') && lowerQuery.includes('看板'))) {
      return {
        entity: '营销运营监控看板',
        type: 'dashboard',
        description: '实时监控营销活动的关键指标，包括转化率、ROI、用户参与度、活动效果等，支持按活动、渠道、时间等多维度分析',
        details: {
          owner: '营销运营组',
          updateTime: '2024-12-10 10:00:00',
          tags: ['营销', '实时监控', '管理看板'],
        },
        structure: {
          charts: [
            { type: '折线图', metric: '转化率趋势', updateFrequency: '小时' },
            { type: '柱状图', metric: '各渠道ROI对比', updateFrequency: '天' },
            { type: '饼图', metric: '用户来源分布', updateFrequency: '实时' },
            { type: '仪表盘', metric: '当日预算消耗', updateFrequency: '分钟' },
            { type: '表格', metric: '活动效果排行', updateFrequency: '小时' },
          ],
        },
        lineage: {
          upstream: ['ads.marketing_metrics', 'ads.channel_performance', 'ads.campaign_analysis'],
          downstream: [],
        },
      }
    }

    // 通用模糊匹配
    if (lowerQuery.includes('表') || lowerQuery.includes('table')) {
      return {
        entity: 'dw.user_behavior_log',
        type: 'table',
        description: '该表记录了用户的行为日志数据，包括访问、点击、购买、分享等行为事件，是用户行为分析的基础数据表',
        details: {
          owner: '数据平台组',
          updateTime: '2024-12-10 09:30:00',
          tags: ['用户行为', '核心表', '天级更新'],
        },
        structure: {
          fields: [
            { name: 'user_id', type: 'BIGINT', comment: '用户ID' },
            { name: 'event_type', type: 'VARCHAR', comment: '事件类型' },
            { name: 'event_time', type: 'TIMESTAMP', comment: '事件时间' },
            { name: 'page_url', type: 'VARCHAR', comment: '页面URL' },
            { name: 'session_id', type: 'VARCHAR', comment: '会话ID' },
          ],
          partitions: ['dt: 日期分区'],
        },
        lineage: {
          upstream: ['ods.user_log', 'ods.click_stream'],
          downstream: ['ads.user_portrait', 'ads.conversion_funnel', 'dws.user_daily_summary'],
        },
      }
    }

    if (lowerQuery.includes('指标') || lowerQuery.includes('metric')) {
      return {
        entity: '日活跃用户数(DAU)',
        type: 'metric',
        description: '统计每日活跃用户数量，定义为当日至少有一次有效行为的独立用户数，是衡量产品活跃度的核心指标',
        details: {
          owner: '产品分析组',
          updateTime: '2024-12-10 08:00:00',
          tags: ['核心指标', '日更新', '产品分析'],
        },
        structure: {
          formula: 'COUNT(DISTINCT user_id)',
          dimensions: ['日期', '平台', '渠道', '用户类型'],
          dataSource: 'dw.user_behavior_log',
        },
        lineage: {
          upstream: ['dw.user_behavior_log', 'dim.user_info'],
          downstream: ['运营日报看板', '产品分析报表', '高管日报'],
        },
      }
    }

    if (lowerQuery.includes('看板') || lowerQuery.includes('dashboard')) {
      return {
        entity: '营销运营监控看板',
        type: 'dashboard',
        description: '实时监控营销活动的关键指标，包括转化率、ROI、用户参与度、活动效果等，支持按活动、渠道、时间等多维度分析',
        details: {
          owner: '营销运营组',
          updateTime: '2024-12-10 10:00:00',
          tags: ['营销', '实时监控', '管理看板'],
        },
        structure: {
          charts: [
            { type: '折线图', metric: '转化率趋势', updateFrequency: '小时' },
            { type: '柱状图', metric: '各渠道ROI对比', updateFrequency: '天' },
            { type: '饼图', metric: '用户来源分布', updateFrequency: '实时' },
            { type: '仪表盘', metric: '当日预算消耗', updateFrequency: '分钟' },
            { type: '表格', metric: '活动效果排行', updateFrequency: '小时' },
          ],
        },
        lineage: {
          upstream: ['ads.marketing_metrics', 'ads.channel_performance', 'ads.campaign_analysis'],
          downstream: [],
        },
      }
    }

    return null
  }

  const formatResponse = (data: ExplorerData): string => {
    let response = `📊 **实体名称**: ${data.entity}\n`
    response += `📁 **类型**: ${data.type === 'table' ? '数据表' : data.type === 'metric' ? '业务指标' : '可视化看板'}\n\n`
    response += `📝 **描述**: ${data.description}\n\n`
    response += `👤 **负责人**: ${data.details.owner}\n`
    response += `🕐 **更新时间**: ${data.details.updateTime}\n`
    response += `🏷️ **标签**: ${data.details.tags.join(', ')}\n\n`

    if (data.type === 'table' && data.structure) {
      response += `📋 **表结构** (${data.structure.fields.length}个字段):\n`
      data.structure.fields.forEach((field: any) => {
        response += `  • ${field.name} (${field.type}): ${field.comment}\n`
      })
      response += `\n📦 **分区信息**: ${data.structure.partitions.join(', ')}\n\n`
    } else if (data.type === 'metric' && data.structure) {
      response += `🔢 **计算公式**: ${data.structure.formula}\n`
      response += `📐 **分析维度**: ${data.structure.dimensions.join(', ')}\n`
      response += `💾 **数据来源**: ${data.structure.dataSource}\n\n`
    } else if (data.type === 'dashboard' && data.structure) {
      response += `📈 **图表组件** (${data.structure.charts.length}个):\n`
      data.structure.charts.forEach((chart: any) => {
        response += `  • ${chart.type} - ${chart.metric} (${chart.updateFrequency}更新)\n`
      })
      response += `\n`
    }

    if (data.lineage) {
      response += `🔗 **数据血缘**:\n`
      if (data.lineage.upstream.length > 0) {
        response += `  ⬆️ 上游: ${data.lineage.upstream.join(', ')}\n`
      }
      if (data.lineage.downstream.length > 0) {
        response += `  ⬇️ 下游: ${data.lineage.downstream.join(', ')}\n`
      }
    }

    return response
  }

  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入要查询的实体名称')
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const result = await parseEntity(inputValue)

      if (result) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: formatResponse(result),
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `抱歉，未能找到"${inputValue}"相关的元数据信息。\n\n💡 提示：请尝试输入具体的表名、指标名或看板名称，例如：\n• "查询用户行为表"\n• "DAU指标"\n• "营销看板"`,
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      message.error('解读失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理划词解读
  const handleTooltipExplain = async () => {
    if (!selectedText) return

    // 点击按钮后立即隐藏按钮并显示弹窗（带加载状态）
    setShowTooltip(false)
    setTooltipResult({} as ExplorerData) // 设置空对象表示弹窗显示但在加载中
    setTooltipLoading(true)
    
    try {
      const result = await parseEntity(selectedText)
      if (result) {
        setTooltipResult(result)
      } else {
        message.warning('未识别到有效的元数据实体')
        setTooltipResult(null)
        // 清除选中状态
        window.getSelection()?.removeAllRanges()
      }
    } catch (error) {
      message.error('解读失败，请重试')
      setTooltipResult(null)
      // 清除选中状态
      window.getSelection()?.removeAllRanges()
    } finally {
      setTooltipLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* 页面标题区 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>
            <BulbOutlined className={styles.pageTitleIcon} />
            元数据智能解读
          </h1>
          <p className={styles.pageSubtitle}>
            基于欧拉AI技术，为您提供表、指标、看板等元数据的即时解读服务
          </p>
        </div>
      </div>

      {/* 主内容区（按使用流程重新排序）*/}
      <div className={styles.mainContent}>
        {/* === 第一部分：核心功能区 === */}
        
        {/* 1. 快速查询工具（主要功能，置顶）*/}
        <Card className={styles.chatCard} bordered={false}>
          <div className={styles.querySection}>
            <div className={styles.queryHeader}>
              <SearchOutlined className={styles.queryIcon} />
              <span className={styles.queryTitle}>快速查询解读</span>
              <span className={styles.queryHint}>输入实体名称，即刻获取详细信息</span>
            </div>
            
            <div className={styles.inputGroup}>
              <Input
                size="large"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                placeholder="输入表名、指标名或看板名称，如：用户行为表"
                disabled={loading}
                className={styles.queryInput}
                prefix={<ApiOutlined style={{ color: '#999' }} />}
              />
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                className={styles.queryButton}
              >
                解读
              </Button>
            </div>

            <div className={styles.quickTags}>
              <span className={styles.tagLabel}>快速体验：</span>
              <Tag
                color="blue"
                className={styles.exampleTag}
                onClick={() => setInputValue('查询用户行为表')}
              >
                用户行为表
              </Tag>
              <Tag
                color="green"
                className={styles.exampleTag}
                onClick={() => setInputValue('DAU指标')}
              >
                DAU指标
              </Tag>
              <Tag
                color="purple"
                className={styles.exampleTag}
                onClick={() => setInputValue('营销监控看板')}
              >
                营销看板
              </Tag>
            </div>
          </div>

          {(messages.length > 0 || loading) && (
            <div className={styles.resultSection}>
              <div className={styles.resultHeader}>
                <span className={styles.resultHeaderTitle}>
                  <RobotOutlined /> 解读结果
                </span>
                <span 
                  className={styles.resultClose}
                  onClick={() => setMessages([])}
                  title="关闭结果"
                >
                  ✕
                </span>
              </div>
              <div className={styles.resultContent}>
                {messages.map((msg, index) => (
                  msg.role === 'assistant' && (
                    <div key={index} className={styles.resultItem}>
                      {msg.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <div key={i} className={styles.resultBold}>
                              {line.replace(/\*\*/g, '')}
                            </div>
                          )
                        } else if (line.startsWith('  •')) {
                          return (
                            <div key={i} className={styles.resultList}>
                              {line}
                            </div>
                          )
                        } else if (line.trim()) {
                          return <div key={i} className={styles.resultText}>{line}</div>
                        } else {
                          return <div key={i} style={{ height: '8px' }} />
                        }
                      })}
                    </div>
                  )
                ))}
                {loading && (
                  <div className={styles.resultLoading}>
                    <Spin /> <span>正在解读元数据，请稍候...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </Card>

        {/* 2. 划词解读体验区（第二功能）*/}
        <Card className={styles.demoCard} bordered={false}>
          <div className={styles.demoHeader}>
            <ThunderboltOutlined className={styles.demoIcon} />
            <div>
              <span className={styles.demoTitle}>划词解读体验</span>
              <span className={styles.demoHint}>选中下方任意高亮文本，体验智能解读功能</span>
            </div>
          </div>

          <div className={styles.demoContent} ref={demoTextRef}>
            <div className={styles.demoSection}>
              <div className={styles.demoLabel}>📊 数据表</div>
              <div className={styles.demoText}>
                在数据仓库中，我们主要使用 <span className={styles.entity}>dw.user_behavior_log</span> 表来记录用户行为，
                该表与 <span className={styles.entity}>dw.order_detail</span> 表进行关联分析，
                可以得到完整的用户画像和购买路径。
              </div>
            </div>

            <div className={styles.demoSection}>
              <div className={styles.demoLabel}>📈 业务指标</div>
              <div className={styles.demoText}>
                核心业务指标包括 <span className={styles.entity}>日活跃用户数(DAU)</span>、
                <span className={styles.entity}>月活跃用户数(MAU)</span>、
                以及 <span className={styles.entity}>用户留存率</span>，
                这些指标用于评估产品的健康度和用户粘性。
              </div>
            </div>

            <div className={styles.demoSection}>
              <div className={styles.demoLabel}>📺 数据看板</div>
              <div className={styles.demoText}>
                运营团队主要使用 <span className={styles.entity}>营销运营监控看板</span> 进行日常监控，
                该看板整合了多个数据源，实时展示关键业务指标的变化趋势。
              </div>
            </div>
          </div>

          <div className={styles.demoTip}>
            💡 提示：选中高亮文本后，点击"欧拉元数据解读"按钮查看详细信息
          </div>
        </Card>

        {/* === 第二部分：扩展能力区 === */}
        
        {/* 3. 浏览器插件宣传（扩展工具）*/}
        <Card className={styles.pluginCard} bordered={false}>
          <div className={styles.pluginHeader}>
            <ChromeOutlined className={styles.pluginIcon} />
            <div>
              <h2 className={styles.pluginTitle}>浏览器插件</h2>
              <p className={styles.pluginSubtitle}>在任意网页使用划词解读，提升工作效率</p>
            </div>
          </div>

          <div className={styles.featureShowcase}>
            <div className={styles.showcaseImage}>
              <div className={styles.mockBrowser}>
                <div className={styles.browserBar}>
                  <div className={styles.browserDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className={styles.browserContent}>
                  <div className={styles.codeBlock}>
                    <div className={styles.codeLine}>
                      SELECT * FROM <span className={styles.highlight}>dw.user_behavior</span>
                    </div>
                    <div className={styles.codeLine}>WHERE dt = '2024-12-10'</div>
                  </div>
                  <div className={styles.popupPreview}>
                    <div className={styles.popupHeader}>
                      <RobotOutlined /> 元数据解读
                    </div>
                    <div className={styles.popupContent}>
                      <strong>dw.user_behavior</strong>
                      <p>用户行为日志表</p>
                      <div className={styles.popupTags}>
                        <Tag color="blue">核心表</Tag>
                        <Tag color="green">天级更新</Tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <div>
                  <h4>智能识别</h4>
                  <p>自动识别页面中的表名、指标名，无需手动输入</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <ThunderboltOutlined className={styles.featureIcon} />
                <div>
                  <h4>即时响应</h4>
                  <p>选中文本立即弹窗解读，秒级响应不中断工作流</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <StarOutlined className={styles.featureIcon} />
                <div>
                  <h4>信息完整</h4>
                  <p>展示表结构、血缘关系、负责人等完整元数据</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <BulbOutlined className={styles.featureIcon} />
                <div>
                  <h4>场景全覆盖</h4>
                  <p>支持SQL编辑器、数据文档、BI平台等工作场景</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* === 第三部分：获取工具区 === */}
        
        {/* 4. 下载与使用指南 */}
        <Card className={styles.guideCard} bordered={false}>
          <h3 className={styles.guideTitle}>
            <DownloadOutlined /> 获取浏览器插件
          </h3>

          <Steps
            direction="vertical"
            current={-1}
            className={styles.guideSteps}
            items={[
              {
                title: '第一步：下载插件',
                description: (
                  <div>
                    <p>支持Chrome、Edge等Chromium内核浏览器</p>
                    <Space size="middle" style={{ marginTop: 8 }}>
                      <Button type="primary" icon={<DownloadOutlined />} size="large">
                        Chrome商店下载
                      </Button>
                      <Button icon={<DownloadOutlined />} size="large">
                        离线包下载
                      </Button>
                    </Space>
                  </div>
                ),
              },
              {
                title: '第二步：安装激活',
                description: (
                  <div>
                    <p>1. 打开浏览器扩展管理页面（chrome://extensions）</p>
                    <p>2. 启用"开发者模式"（离线包安装需要）</p>
                    <p>3. 拖入.crx文件或点击"加载已解压的扩展程序"</p>
                    <p>4. 将插件图标固定到工具栏，方便快速访问</p>
                  </div>
                ),
              },
              {
                title: '第三步：配置接入',
                description: (
                  <div>
                    <p>1. 点击插件图标，进入设置页面</p>
                    <p>2. 输入元数据平台API地址和访问密钥</p>
                    <p>3. 点击"测试连接"，确保服务可用</p>
                    <p>4. （可选）设置自动启用的网站域名白名单</p>
                  </div>
                ),
              },
              {
                title: '第四步：开始使用',
                description: (
                  <div>
                    <p>✅ 在SQL编辑器中选中表名，即时查看元数据</p>
                    <p>✅ 在数据文档中划词理解指标定义</p>
                    <p>✅ 在BI平台上追踪看板的数据来源</p>
                    <p className={styles.tipText}>
                      💡 提示：首次使用建议查看
                      <a href="#" style={{ color: '#1890ff', marginLeft: 4 }}>
                        快速入门教程
                      </a>
                      了解更多使用技巧
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <div className={styles.supportInfo}>
            <h4>技术支持</h4>
            <p>📧 邮箱: metadata-support@company.com</p>
            <p>📚 文档: https://docs.metadata-platform.com</p>
            <p>💬 反馈: 在插件中点击"意见反馈"提交问题</p>
          </div>
        </Card>
      </div>

      {/* 划词解读浮动按钮 */}
      {showTooltip && !tooltipResult && (
        <div
          className={styles.tooltipButton}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <Button
            type="primary"
            size="small"
            icon={<ApiOutlined />}
            onClick={handleTooltipExplain}
            loading={tooltipLoading}
            className={styles.explainBtn}
          >
            欧拉元数据解读
          </Button>
        </div>
      )}

      {/* 划词解读结果弹窗 */}
      {tooltipResult && (
        <div
          className={styles.tooltipPopup}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y + 40}px`,
          }}
        >
          <div className={styles.popupHeader}>
            <RobotOutlined /> 欧拉元数据解读
            <span
              className={styles.popupClose}
              onClick={() => {
                setTooltipResult(null)
                setShowTooltip(false)
                setTooltipLoading(false)
                // 清除选中状态
                window.getSelection()?.removeAllRanges()
              }}
            >
              ✕
            </span>
          </div>
          <div className={styles.popupBody}>
            {tooltipLoading ? (
              <div className={styles.popupLoading}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#666' }}>正在解读元数据，请稍候...</div>
              </div>
            ) : (
              <>
                <div className={styles.popupItem}>
                  <strong>实体名称</strong>
                  <div>{tooltipResult.entity}</div>
                </div>
                <div className={styles.popupItem}>
                  <strong>类型</strong>
                  <Tag color={tooltipResult.type === 'table' ? 'blue' : tooltipResult.type === 'metric' ? 'green' : 'purple'}>
                    {tooltipResult.type === 'table' ? '数据表' : tooltipResult.type === 'metric' ? '业务指标' : '可视化看板'}
                  </Tag>
                </div>
                <div className={styles.popupItem}>
                  <strong>描述</strong>
                  <div>{tooltipResult.description}</div>
                </div>
                <div className={styles.popupItem}>
                  <strong>负责人</strong>
                  <div>{tooltipResult.details.owner}</div>
                </div>
                <div className={styles.popupItem}>
                  <strong>标签</strong>
                  <div>
                    {tooltipResult.details.tags.map((tag, idx) => (
                      <Tag key={idx} style={{ marginRight: 4 }}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
                {tooltipResult.type === 'table' && tooltipResult.structure && (
                  <div className={styles.popupItem}>
                    <strong>核心字段</strong>
                    <div className={styles.popupFields}>
                      {tooltipResult.structure.fields.slice(0, 3).map((field: any, idx: number) => (
                        <div key={idx} className={styles.fieldItem}>
                          • {field.name} ({field.type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tooltipResult.type === 'metric' && tooltipResult.structure && (
                  <div className={styles.popupItem}>
                    <strong>计算公式</strong>
                    <code className={styles.popupCode}>{tooltipResult.structure.formula}</code>
                  </div>
                )}
                <div className={styles.popupActions}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setInputValue(selectedText)
                      setTooltipResult(null)
                      setShowTooltip(false)
                      setTooltipLoading(false)
                      // 清除选中状态
                      window.getSelection()?.removeAllRanges()
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    查看完整信息 →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MetadataExplorer
