import { useState } from 'react'
import { Card, Button, Form, Input, message, Steps, Space, Checkbox, Tag, Typography, Alert } from 'antd'
import { ArrowRightOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { mockCapabilities, mockAlbums } from '../../data/mockData'
import EntityScopeModal from './EntityScopeModal'
import type { AtomicCapability, MetadataType } from '../../types'
import styles from './AdvancedBuilder.module.css'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

const AdvancedBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [entityScope, setEntityScope] = useState<any>(null)
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [scopeModalVisible, setScopeModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleScopeSet = (scope: any) => {
    setEntityScope(scope)
    setScopeModalVisible(false)
    // 清空已选能力，因为实体类型可能变了
    setSelectedCapabilities([])
    message.success('实体范围配置成功，请重新选择原子能力')
  }

  // 获取当前实体类型
  const getCurrentEntityType = (): MetadataType | null => {
    if (!entityScope) return null
    return entityScope.entityType
  }

  // 根据实体类型过滤能力
  const getFilteredCapabilities = () => {
    const entityType = getCurrentEntityType()
    if (!entityType) return []
    
    return mockCapabilities.filter(cap => cap.type === entityType)
  }

  const handleCapabilityToggle = (capId: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capId) 
        ? prev.filter(id => id !== capId)
        : [...prev, capId]
    )
  }

  const handleNext = () => {
    if (currentStep === 0 && !entityScope) {
      message.warning('请先配置实体范围')
      return
    }
    if (currentStep === 1 && selectedCapabilities.length === 0) {
      message.warning('请至少选择一个原子能力')
      return
    }
    setCurrentStep(prev => prev + 1)
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleFinish = () => {
    form.validateFields().then(() => {
      message.success('MCP服务构建成功！')
      // 重置
      setCurrentStep(0)
      setEntityScope(null)
      setSelectedCapabilities([])
      form.resetFields()
    })
  }

  const getEntityTypeLabel = (type: MetadataType) => {
    const labels = {
      table: '表',
      metric: '指标',
      dashboard: '看板'
    }
    return labels[type]
  }

  const getScopeDisplay = () => {
    if (!entityScope) return '未配置'
    
    const entityTypeLabel = getEntityTypeLabel(entityScope.entityType)
    
    if (entityScope.type === 'album') {
      const album = mockAlbums.find(a => a.id === entityScope.value)
      return album ? `${album.name} (${album.entityCount}个${entityTypeLabel})` : '未知专辑'
    } else {
      const rule = entityScope.value
      const parts = [`实体类型: ${entityTypeLabel}`]
      if (rule.database) parts.push(`数据库: ${rule.database}`)
      if (rule.tablePattern) parts.push(`表名: ${rule.tablePattern}`)
      if (rule.tags?.length) parts.push(`标签: ${rule.tags.join(', ')}`)
      return parts.join(' | ') || '自定义规则'
    }
  }

  const getSelectedCapabilityNames = () => {
    return selectedCapabilities.map(id => {
      const cap = mockCapabilities.find(c => c.id === id)
      return cap?.name || ''
    })
  }

  const capabilitiesByCategory = getFilteredCapabilities().reduce((acc, cap) => {
    if (!acc[cap.category]) {
      acc[cap.category] = []
    }
    acc[cap.category].push(cap)
    return acc
  }, {} as Record<string, AtomicCapability[]>)

  const steps = [
    {
      title: '配置实体范围',
      description: '选择数据范围',
    },
    {
      title: '选择原子能力',
      description: '勾选所需能力',
    },
    {
      title: 'MCP服务配置',
      description: '填写服务信息',
    },
  ]

  return (
    <div className={styles.container}>
      <Steps current={currentStep} items={steps} className={styles.steps} />

      <div className={styles.content}>
        {/* 步骤1: 配置实体范围 */}
        {currentStep === 0 && (
          <div className={styles.stepContent}>
            <Card className={styles.stepCard}>
              <Title level={4}>配置实体范围</Title>
              <Paragraph type="secondary">
                通过规则筛选或专辑筛选方式，定义MCP服务可访问的元数据实体范围
              </Paragraph>

              <div className={styles.scopeSection}>
                <div className={styles.scopeInfo}>
                  <Text strong>当前配置：</Text>
                  <div className={styles.scopeDisplay}>
                    {getScopeDisplay()}
                  </div>
                </div>

                <div className={styles.configAction}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => setScopeModalVisible(true)}
                  >
                    {entityScope ? '重新配置' : '开始配置'}
                  </Button>
                </div>
              </div>

              {entityScope && (
                <div className={styles.scopePreview}>
                  <Text type="secondary">✓ 实体范围配置完成，点击下一步继续</Text>
                </div>
              )}
            </Card>

            <div className={styles.stepActions}>
              <Button size="large" disabled>
                上一步
              </Button>
              <Button type="primary" size="large" onClick={handleNext}>
                下一步 <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* 步骤2: 选择原子能力 */}
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <Card className={styles.stepCard}>
              <Title level={4}>选择原子能力</Title>
              <Paragraph type="secondary">
                勾选需要的元数据原子能力，组合构建您的专属MCP服务
              </Paragraph>

              <Alert
                message={`当前实体类型：${getEntityTypeLabel(getCurrentEntityType()!)}，只能选择${getEntityTypeLabel(getCurrentEntityType()!)}相关的原子能力`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <div className={styles.selectedCount}>
                已选择 <Text strong>{selectedCapabilities.length}</Text> 个能力
              </div>

              {Object.keys(capabilitiesByCategory).length === 0 ? (
                <Alert
                  message="当前实体类型暂无可用的原子能力"
                  type="info"
                  showIcon
                  style={{ marginTop: 24 }}
                />
              ) : (
                <div className={styles.capabilityList}>
                  {Object.entries(capabilitiesByCategory).map(([category, capabilities]) => (
                    <div key={category} className={styles.categorySection}>
                      <div className={styles.categoryHeader}>{category}</div>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {capabilities.map(cap => (
                          <Card
                            key={cap.id}
                            size="small"
                            className={`${styles.capabilityCard} ${
                              selectedCapabilities.includes(cap.id) ? styles.selected : ''
                            }`}
                          >
                            <Checkbox
                              checked={selectedCapabilities.includes(cap.id)}
                              onChange={() => handleCapabilityToggle(cap.id)}
                            >
                              <div className={styles.capabilityInfo}>
                                <Text strong>{cap.name}</Text>
                                <Text type="secondary" className={styles.capabilityDesc}>
                                  {cap.description}
                                </Text>
                                <Space size="small" className={styles.capabilityTags}>
                                  <Tag color="blue" size="small">{getEntityTypeLabel(cap.type)}</Tag>
                                  {cap.tags.slice(0, 2).map(tag => (
                                    <Tag key={tag} size="small">{tag}</Tag>
                                  ))}
                                </Space>
                              </div>
                            </Checkbox>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className={styles.stepActions}>
              <Button size="large" onClick={handlePrev}>
                <ArrowLeftOutlined /> 上一步
              </Button>
              <Button type="primary" size="large" onClick={handleNext}>
                下一步 <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        )}

        {/* 步骤3: MCP服务配置 */}
        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <Card className={styles.stepCard}>
              <Title level={4}>MCP服务配置</Title>
              <Paragraph type="secondary">
                填写MCP服务的基本信息和配置参数
              </Paragraph>

              <Form form={form} layout="vertical" className={styles.configForm}>
                <Form.Item
                  label="服务名称"
                  name="name"
                  rules={[{ required: true, message: '请输入服务名称' }]}
                >
                  <Input placeholder="请输入MCP服务名称" size="large" />
                </Form.Item>

                <Form.Item
                  label="服务描述"
                  name="description"
                  rules={[{ required: true, message: '请输入服务描述' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="描述该MCP服务的用途和使用场景"
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="实体范围">
                  <div className={styles.summaryItem}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>{getScopeDisplay()}</Text>
                  </div>
                </Form.Item>

                <Form.Item label="包含能力">
                  <div className={styles.summaryItem}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>{selectedCapabilities.length} 个能力</Text>
                  </div>
                  <div className={styles.capabilityTags}>
                    {getSelectedCapabilityNames().map((name, index) => (
                      <Tag key={index} color="blue">{name}</Tag>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item label="调用频率限制">
                  <Input
                    placeholder="例如: 1000次/小时"
                    defaultValue="1000次/小时"
                    size="large"
                  />
                </Form.Item>
              </Form>
            </Card>

            <div className={styles.stepActions}>
              <Button size="large" onClick={handlePrev}>
                <ArrowLeftOutlined /> 上一步
              </Button>
              <Button type="primary" size="large" onClick={handleFinish}>
                完成并生成 <CheckCircleOutlined />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EntityScopeModal
        visible={scopeModalVisible}
        onCancel={() => setScopeModalVisible(false)}
        onOk={handleScopeSet}
      />
    </div>
  )
}

export default AdvancedBuilder
