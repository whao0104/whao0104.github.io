import type { AtomicCapability, MCPTemplate, MetadataAlbum, MCPService } from '../types'

// 原子能力Mock数据
export const mockCapabilities: AtomicCapability[] = [
  {
    id: '1',
    name: '获取表结构',
    type: 'table',
    category: '基础查询',
    description: '获取指定表的完整结构信息，包括字段名、类型、注释等',
    icon: '📋',
    callCount: 1250,
    responseTime: 45,
    tags: ['表结构', '元数据', '高频'],
  },
  {
    id: '2',
    name: '获取表血缘',
    type: 'table',
    category: '血缘分析',
    description: '追溯表的上下游依赖关系，支持多层血缘查询',
    icon: '🔗',
    callCount: 890,
    responseTime: 120,
    tags: ['血缘', '依赖分析'],
  },
  {
    id: '3',
    name: '获取字段血缘',
    type: 'table',
    category: '血缘分析',
    description: '获取字段级别的血缘关系，精确到字段转换逻辑',
    icon: '🎯',
    callCount: 560,
    responseTime: 150,
    tags: ['血缘', '字段级'],
  },
  {
    id: '4',
    name: '获取表统计信息',
    type: 'table',
    category: '数据质量',
    description: '查询表的行数、大小、分区信息等统计数据',
    icon: '📊',
    callCount: 2100,
    responseTime: 60,
    tags: ['统计', '质量'],
  },
  {
    id: '5',
    name: '获取指标定义',
    type: 'metric',
    category: '指标管理',
    description: '获取业务指标的计算口径、维度、度量等定义信息',
    icon: '📈',
    callCount: 780,
    responseTime: 55,
    tags: ['指标', '定义'],
  },
  {
    id: '6',
    name: '获取指标血缘',
    type: 'metric',
    category: '血缘分析',
    description: '追溯指标的计算链路和依赖的数据表',
    icon: '🔍',
    callCount: 450,
    responseTime: 100,
    tags: ['指标', '血缘'],
  },
  {
    id: '7',
    name: '获取看板配置',
    type: 'dashboard',
    category: '可视化',
    description: '获取看板的布局、组件配置和数据源绑定信息',
    icon: '📺',
    callCount: 320,
    responseTime: 70,
    tags: ['看板', '配置'],
  },
  {
    id: '8',
    name: '获取看板数据',
    type: 'dashboard',
    category: '数据查询',
    description: '实时查询看板关联的数据，支持参数化查询',
    icon: '💾',
    callCount: 1500,
    responseTime: 200,
    tags: ['看板', '数据'],
  },
  {
    id: '9',
    name: '获取表负责人',
    type: 'table',
    category: '管理信息',
    description: '查询表的所有者、管理员和相关责任人信息',
    icon: '👤',
    callCount: 680,
    responseTime: 40,
    tags: ['管理', '责任人'],
  },
  {
    id: '10',
    name: '获取表访问日志',
    type: 'table',
    category: '审计追踪',
    description: '查询表的访问记录，包括时间、用户、操作类型等',
    icon: '📝',
    callCount: 420,
    responseTime: 90,
    tags: ['日志', '审计'],
  },
  {
    id: '11',
    name: '获取数据质量报告',
    type: 'table',
    category: '数据质量',
    description: '生成表的数据质量评估报告，包括完整性、准确性等指标',
    icon: '✅',
    callCount: 290,
    responseTime: 180,
    tags: ['质量', '报告'],
  },
  {
    id: '12',
    name: '获取指标趋势',
    type: 'metric',
    category: '数据分析',
    description: '查询指标的历史趋势数据，支持多种时间粒度',
    icon: '📉',
    callCount: 950,
    responseTime: 130,
    tags: ['指标', '趋势'],
  },
]

// MCP模板Mock数据
export const mockTemplates: MCPTemplate[] = [
  {
    id: 't1',
    name: '数据开发助手',
    description: '面向数据开发人员，提供表结构、血缘、统计等基础能力',
    icon: '💻',
    capabilities: ['1', '2', '4', '9'],
    useCase: '数据开发、ETL建设',
  },
  {
    id: 't2',
    name: '数据治理顾问',
    description: '支持数据质量检查、审计追踪等治理场景',
    icon: '🛡️',
    capabilities: ['4', '10', '11'],
    useCase: '数据治理、合规审计',
  },
  {
    id: 't3',
    name: '指标分析专家',
    description: '提供指标定义、血缘、趋势等全方位分析能力',
    icon: '📊',
    capabilities: ['5', '6', '12'],
    useCase: '业务分析、指标管理',
  },
  {
    id: 't4',
    name: '可视化看板管家',
    description: '管理看板配置和数据查询，服务BI场景',
    icon: '📈',
    capabilities: ['7', '8'],
    useCase: 'BI看板、数据可视化',
  },
]

// 元数据专辑Mock数据
export const mockAlbums: MetadataAlbum[] = [
  {
    id: 'a1',
    name: '营销域核心表',
    description: '营销相关的核心业务表，包括用户、订单、活动等',
    entityType: 'table',
    entityCount: 45,
    coverImage: '🎯',
    tags: ['营销', '核心', '高频'],
  },
  {
    id: 'a2',
    name: '财务指标集',
    description: '财务分析相关的指标体系，涵盖收入、成本、利润等',
    entityType: 'metric',
    entityCount: 28,
    coverImage: '💰',
    tags: ['财务', '指标'],
  },
  {
    id: 'a3',
    name: '用户行为表',
    description: '用户行为埋点和分析相关的表',
    entityType: 'table',
    entityCount: 62,
    coverImage: '👥',
    tags: ['用户', '行为'],
  },
  {
    id: 'a4',
    name: '运营看板集',
    description: '日常运营监控的看板集合',
    entityType: 'dashboard',
    entityCount: 18,
    coverImage: '📊',
    tags: ['运营', '看板'],
  },
]

// MCP服务Mock数据
export const mockServices: MCPService[] = [
  {
    id: 's1',
    name: '营销数据分析MCP',
    description: '服务营销团队的数据分析需求',
    status: 'active',
    capabilities: ['1', '2', '4', '5'],
    entityScope: {
      type: 'album',
      value: 'a1',
    },
    callCount: 3250,
    errorRate: 0.5,
    avgResponseTime: 85,
    createdAt: '2024-11-15',
    creator: '张三',
  },
  {
    id: 's2',
    name: '财务报表MCP',
    description: '支持财务报表生成和指标查询',
    status: 'active',
    capabilities: ['5', '6', '12'],
    entityScope: {
      type: 'album',
      value: 'a2',
    },
    callCount: 1890,
    errorRate: 0.2,
    avgResponseTime: 95,
    createdAt: '2024-11-20',
    creator: '李四',
  },
  {
    id: 's3',
    name: '数据质量巡检MCP',
    description: '定期巡检数据质量，生成报告',
    status: 'testing',
    capabilities: ['4', '11'],
    entityScope: {
      type: 'rule',
      value: { tags: ['核心表'], hotness: 80 },
    },
    callCount: 420,
    errorRate: 1.2,
    avgResponseTime: 150,
    createdAt: '2024-12-01',
    creator: '王五',
  },
  {
    id: 's4',
    name: '用户画像MCP',
    description: '用户行为分析和画像构建',
    status: 'active',
    capabilities: ['1', '4', '10'],
    entityScope: {
      type: 'album',
      value: 'a3',
    },
    callCount: 5620,
    errorRate: 0.8,
    avgResponseTime: 110,
    createdAt: '2024-10-28',
    creator: '赵六',
  },
]

// 生成监控趋势数据
export const generateMonitorData = (days: number = 7) => {
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const timeStr = `${date.getMonth() + 1}/${date.getDate()}`
    
    data.push({
      time: timeStr,
      callCount: Math.floor(Math.random() * 1000) + 500,
      errorCount: Math.floor(Math.random() * 20) + 2,
      avgResponseTime: Math.floor(Math.random() * 50) + 80,
    })
  }
  
  return data
}
