// 元数据类型
export type MetadataType = 'table' | 'metric' | 'dashboard'

// 原子能力
export interface AtomicCapability {
  id: string
  name: string
  type: MetadataType
  category: string
  description: string
  icon: string
  callCount: number
  responseTime: number
  tags: string[]
}

// MCP模板
export interface MCPTemplate {
  id: string
  name: string
  description: string
  icon: string
  capabilities: string[]
  useCase: string
}

// 元数据专辑
export interface MetadataAlbum {
  id: string
  name: string
  description: string
  entityType: MetadataType // 专辑包含的实体类型
  entityCount: number
  coverImage: string
  tags: string[]
}

// 筛选规则
export interface FilterRule {
  entityType: MetadataType // 筛选的实体类型
  database?: string
  tablePattern?: string
  tags?: string[]
  hotness?: number
  business?: string[]
}

// MCP服务
export interface MCPService {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'testing'
  capabilities: string[]
  entityScope: {
    type: 'rule' | 'album'
    value: FilterRule | string
  }
  callCount: number
  errorRate: number
  avgResponseTime: number
  createdAt: string
  creator: string
}

// 监控数据
export interface MonitorData {
  time: string
  callCount: number
  errorCount: number
  avgResponseTime: number
}

// 权限配置
export interface Permission {
  userId: string
  userName: string
  role: 'read' | 'write' | 'admin'
}
