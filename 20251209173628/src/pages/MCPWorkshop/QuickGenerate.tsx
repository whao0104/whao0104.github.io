import { useState } from 'react'
import { Row, Col, Card, Form, Input, Button, Space, message, Modal, Tag } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { mockTemplates, mockCapabilities, mockAlbums } from '../../data/mockData'
import EntityScopeModal from './EntityScopeModal'
import type { MCPTemplate } from '../../types'
import styles from './QuickGenerate.module.css'

const { TextArea } = Input

const QuickGenerate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MCPTemplate | null>(null)
  const [form] = Form.useForm()
  const [scopeModalVisible, setScopeModalVisible] = useState(false)
  const [entityScope, setEntityScope] = useState<any>(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  const handleTemplateSelect = (template: MCPTemplate) => {
    setSelectedTemplate(template)
    form.setFieldsValue({
      name: template.name,
      description: template.description,
    })
  }

  const handleScopeSet = (scope: any) => {
    setEntityScope(scope)
    setScopeModalVisible(false)
    message.success('实体范围配置成功')
  }

  const handlePreview = () => {
    form.validateFields().then(() => {
      if (!entityScope) {
        message.warning('请先配置实体范围')
        return
      }
      setPreviewVisible(true)
    })
  }

  const handleGenerate = () => {
    message.success('MCP服务生成成功！')
    setPreviewVisible(false)
    form.resetFields()
    setSelectedTemplate(null)
    setEntityScope(null)
  }

  const getCapabilityNames = () => {
    if (!selectedTemplate) return []
    return selectedTemplate.capabilities.map(id => {
      const cap = mockCapabilities.find(c => c.id === id)
      return cap?.name || ''
    })
  }

  const getScopeDisplay = () => {
    if (!entityScope) return '未配置'
    if (entityScope.type === 'album') {
      const album = mockAlbums.find(a => a.id === entityScope.value)
      return album ? `专辑: ${album.name} (${album.entityCount}个实体)` : '未知专辑'
    } else {
      const rule = entityScope.value
      const parts = []
      if (rule.database) parts.push(`数据库: ${rule.database}`)
      if (rule.tablePattern) parts.push(`表名: ${rule.tablePattern}`)
      if (rule.tags?.length) parts.push(`标签: ${rule.tags.join(', ')}`)
      return `规则筛选: ${parts.join(' | ')}`
    }
  }

  return (
    <div className={styles.container}>
      <Row gutter={24}>
        <Col span={10}>
          <div className={styles.templateSection}>
            <h3>选择模板</h3>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {mockTemplates.map(template => (
                <Card
                  key={template.id}
                  hoverable
                  className={`${styles.templateCard} ${
                    selectedTemplate?.id === template.id ? styles.selected : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className={styles.templateHeader}>
                    <span className={styles.templateIcon}>{template.icon}</span>
                    <div className={styles.templateInfo}>
                      <h4>{template.name}</h4>
                      <p>{template.description}</p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <CheckOutlined className={styles.checkIcon} />
                    )}
                  </div>
                  <div className={styles.templateMeta}>
                    <Tag color="blue">{template.useCase}</Tag>
                    <span className={styles.capCount}>
                      {template.capabilities.length} 个能力
                    </span>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        </Col>

        <Col span={14}>
          <div className={styles.configSection}>
            <h3>配置MCP服务</h3>
            {selectedTemplate ? (
              <Form form={form} layout="vertical" className={styles.form}>
                <Form.Item
                  label="服务名称"
                  name="name"
                  rules={[{ required: true, message: '请输入服务名称' }]}
                >
                  <Input placeholder="请输入MCP服务名称" />
                </Form.Item>

                <Form.Item
                  label="服务描述"
                  name="description"
                  rules={[{ required: true, message: '请输入服务描述' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="描述该MCP服务的用途和使用场景"
                  />
                </Form.Item>

                <Form.Item label="包含能力">
                  <div className={styles.capabilityList}>
                    {getCapabilityNames().map((name, index) => (
                      <Tag key={index} color="blue">
                        {name}
                      </Tag>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item label="实体范围">
                  <div className={styles.scopeConfig}>
                    <div className={styles.scopeDisplay}>{getScopeDisplay()}</div>
                    <Button
                      type="primary"
                      onClick={() => setScopeModalVisible(true)}
                    >
                      配置范围
                    </Button>
                  </div>
                </Form.Item>

                <Form.Item label="调用频率限制">
                  <Input
                    placeholder="例如: 1000次/小时"
                    defaultValue="1000次/小时"
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" size="large" onClick={handlePreview}>
                      预览配置
                    </Button>
                    <Button size="large" onClick={() => form.resetFields()}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div className={styles.emptyState}>
                <p>👈 请先从左侧选择一个模板</p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <EntityScopeModal
        visible={scopeModalVisible}
        onCancel={() => setScopeModalVisible(false)}
        onOk={handleScopeSet}
      />

      <Modal
        title="MCP服务配置预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        onOk={handleGenerate}
        width={700}
        okText="确认生成"
        cancelText="返回修改"
      >
        <div className={styles.previewContent}>
          <h4>基本信息</h4>
          <p><strong>服务名称：</strong>{form.getFieldValue('name')}</p>
          <p><strong>服务描述：</strong>{form.getFieldValue('description')}</p>
          
          <h4>包含能力</h4>
          <div className={styles.previewCapabilities}>
            {getCapabilityNames().map((name, index) => (
              <Tag key={index} color="blue">{name}</Tag>
            ))}
          </div>

          <h4>实体范围</h4>
          <p>{getScopeDisplay()}</p>

          <h4>调用限制</h4>
          <p>1000次/小时</p>
        </div>
      </Modal>
    </div>
  )
}

export default QuickGenerate
