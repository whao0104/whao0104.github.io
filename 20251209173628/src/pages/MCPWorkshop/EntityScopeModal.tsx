import { useState } from 'react'
import { Modal, Tabs, Form, Input, Select, InputNumber, Card, Row, Col, Tag, Table, Radio, Alert, message } from 'antd'
import { mockAlbums } from '../../data/mockData'
import type { FilterRule, MetadataType } from '../../types'
import styles from './EntityScopeModal.module.css'

const { Option } = Select

interface Props {
  visible: boolean
  onCancel: () => void
  onOk: (scope: any) => void
}

const EntityScopeModal = ({ visible, onCancel, onOk }: Props) => {
  const [activeTab, setActiveTab] = useState('rule')
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [selectedEntityType, setSelectedEntityType] = useState<MetadataType>('table')
  const [form] = Form.useForm()

  const handleCancel = () => {
    // 重置状态
    setActiveTab('rule')
    setSelectedAlbum(null)
    setSelectedEntityType('table')
    form.resetFields()
    onCancel()
  }

  const handleOk = () => {
    if (activeTab === 'album') {
      if (!selectedAlbum) {
        message.warning('请选择一个专辑')
        return
      }
      const album = mockAlbums.find(a => a.id === selectedAlbum)
      onOk({ 
        type: 'album', 
        value: selectedAlbum,
        entityType: album?.entityType 
      })
      // 重置状态
      setActiveTab('rule')
      setSelectedAlbum(null)
    } else {
      form.validateFields().then(values => {
        const rule: FilterRule = {
          entityType: selectedEntityType,
          database: values.database,
          tablePattern: values.tablePattern,
          tags: values.tags,
          hotness: values.hotness,
          business: values.business,
        }
        onOk({ 
          type: 'rule', 
          value: rule,
          entityType: selectedEntityType 
        })
        // 重置状态
        form.resetFields()
      }).catch(() => {
        // 验证失败，不关闭Modal
      })
    }
  }

  const getEntityTypeLabel = (type: MetadataType) => {
    const labels = {
      table: '表',
      metric: '指标',
      dashboard: '看板'
    }
    return labels[type]
  }

  const rulePreviewData = [
    { key: '1', table: 'user_info', database: 'marketing_db', tags: ['核心表', '用户'] },
    { key: '2', table: 'order_detail', database: 'marketing_db', tags: ['核心表', '订单'] },
    { key: '3', table: 'campaign_data', database: 'marketing_db', tags: ['活动'] },
  ]

  const rulePreviewColumns = [
    { title: '表名', dataIndex: 'table', key: 'table' },
    { title: '数据库', dataIndex: 'database', key: 'database' },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags.map(tag => <Tag key={tag}>{tag}</Tag>),
    },
  ]

  const items = [
    {
      key: 'rule',
      label: '规则筛选',
      children: (
        <div className={styles.tabContent}>
          <Alert
            message="注意：同一个MCP服务只能包含一种类型的元数据实体"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form form={form} layout="vertical">
            <Form.Item label="实体类型" required>
              <Radio.Group 
                value={selectedEntityType} 
                onChange={e => setSelectedEntityType(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="table">表</Radio.Button>
                <Radio.Button value="metric">指标</Radio.Button>
                <Radio.Button value="dashboard">看板</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="数据库" name="database">
              <Select placeholder="选择数据库" allowClear>
                <Option value="marketing_db">营销数据库</Option>
                <Option value="finance_db">财务数据库</Option>
                <Option value="user_db">用户数据库</Option>
              </Select>
            </Form.Item>

            <Form.Item label="表名正则" name="tablePattern">
              <Input placeholder="例如: user_*, order_*" />
            </Form.Item>

            <Form.Item label="标签" name="tags">
              <Select mode="multiple" placeholder="选择标签" allowClear>
                <Option value="核心表">核心表</Option>
                <Option value="用户">用户</Option>
                <Option value="订单">订单</Option>
                <Option value="活动">活动</Option>
                <Option value="指标">指标</Option>
              </Select>
            </Form.Item>

            <Form.Item label="热度阈值" name="hotness">
              <InputNumber
                min={0}
                max={100}
                placeholder="0-100"
                style={{ width: '100%' }}
                addonAfter="分"
              />
            </Form.Item>

            <Form.Item label="业务域" name="business">
              <Select mode="multiple" placeholder="选择业务域" allowClear>
                <Option value="营销">营销</Option>
                <Option value="财务">财务</Option>
                <Option value="用户运营">用户运营</Option>
                <Option value="商品">商品</Option>
              </Select>
            </Form.Item>
          </Form>

          <div className={styles.preview}>
            <h4>预览结果（示例）</h4>
            <Table
              dataSource={rulePreviewData}
              columns={rulePreviewColumns}
              pagination={false}
              size="small"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'album',
      label: '专辑筛选',
      children: (
        <div className={styles.tabContent}>
          <Alert
            message="注意：选择专辑后，只能选择该专辑实体类型对应的原子能力"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Row gutter={[16, 16]}>
            {mockAlbums.map(album => (
              <Col key={album.id} span={12}>
                <Card
                  hoverable
                  className={`${styles.albumCard} ${
                    selectedAlbum === album.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  <div className={styles.albumHeader}>
                    <div className={styles.albumIcon}>{album.coverImage}</div>
                    <Tag color="blue">{getEntityTypeLabel(album.entityType)}</Tag>
                  </div>
                  <h4>{album.name}</h4>
                  <p>{album.description}</p>
                  <div className={styles.albumMeta}>
                    <span>包含 {album.entityCount} 个实体</span>
                    <div className={styles.albumTags}>
                      {album.tags.map(tag => (
                        <Tag key={tag} size="small">{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title="配置实体范围"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      okText="确认"
      cancelText="取消"
      destroyOnClose
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  )
}

export default EntityScopeModal
