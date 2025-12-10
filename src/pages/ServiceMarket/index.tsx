import { useState } from 'react'
import { Input, Select, Card, Row, Col, Tag, Space, Typography, Pagination, Modal, Descriptions, Statistic } from 'antd'
import { SearchOutlined, ApiOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons'
import { mockCapabilities } from '../../data/mockData'
import type { AtomicCapability, MetadataType } from '../../types'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const ServiceMarket = () => {
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<MetadataType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCapability, setSelectedCapability] = useState<AtomicCapability | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)

  const pageSize = 16

  // 获取所有类别
  const categories = ['all', ...Array.from(new Set(mockCapabilities.map(c => c.category)))]

  // 过滤数据
  const filteredData = mockCapabilities.filter(item => {
    const matchSearch = item.name.includes(searchText) || item.description.includes(searchText)
    const matchType = typeFilter === 'all' || item.type === typeFilter
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchSearch && matchType && matchCategory
  })

  // 分页数据
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getTypeColor = (type: MetadataType) => {
    const colors = {
      table: 'blue',
      metric: 'green',
      dashboard: 'orange',
    }
    return colors[type]
  }

  const getTypeLabel = (type: MetadataType) => {
    const labels = {
      table: '表',
      metric: '指标',
      dashboard: '看板',
    }
    return labels[type]
  }

  const handleCardClick = (capability: AtomicCapability) => {
    setSelectedCapability(capability)
    setDetailVisible(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>服务市场</Title>
        <Text type="secondary">浏览和选择元数据原子能力，为业务场景构建专属MCP服务</Text>
      </div>

      <div className={styles.filterBar}>
        <Input
          placeholder="搜索能力名称或描述"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 150 }}
        >
          <Option value="all">全部类型</Option>
          <Option value="table">表</Option>
          <Option value="metric">指标</Option>
          <Option value="dashboard">看板</Option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 150 }}
        >
          {categories.map(cat => (
            <Option key={cat} value={cat}>
              {cat === 'all' ? '全部分类' : cat}
            </Option>
          ))}
        </Select>
        <Text type="secondary">
          共找到 <Text strong>{filteredData.length}</Text> 个能力
        </Text>
      </div>

      <Row gutter={[16, 16]} className={styles.cardGrid}>
        {paginatedData.map(capability => (
          <Col key={capability.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className={styles.card}
              onClick={() => handleCardClick(capability)}
            >
              <Title level={5} className={styles.cardTitle}>
                {capability.name}
              </Title>
              <Paragraph
                ellipsis={{ rows: 2 }}
                type="secondary"
                className={styles.cardDesc}
              >
                {capability.description}
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div className={styles.cardTags}>
                  <Tag color={getTypeColor(capability.type)} size="small">
                    {getTypeLabel(capability.type)}
                  </Tag>
                  <Tag size="small">{capability.category}</Tag>
                </div>
                <div className={styles.cardStats}>
                  <Space size="middle">
                    <span>
                      <ApiOutlined /> {capability.callCount}
                    </span>
                    <span>
                      <ClockCircleOutlined /> {capability.responseTime}ms
                    </span>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <div className={styles.pagination}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={setCurrentPage}
          showSizeChanger={false}
          showQuickJumper
        />
      </div>

      <Modal
        title="能力详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={720}
        footer={null}
      >
        {selectedCapability && (
          <div className={styles.detailContent}>
            <div className={styles.detailHeader}>
              <span className={styles.detailIcon}>{selectedCapability.icon}</span>
              <div>
                <Title level={3}>{selectedCapability.name}</Title>
                <Space>
                  <Tag color={getTypeColor(selectedCapability.type)}>
                    {getTypeLabel(selectedCapability.type)}
                  </Tag>
                  <Tag>{selectedCapability.category}</Tag>
                </Space>
              </div>
            </div>

            <Paragraph className={styles.detailDesc}>
              {selectedCapability.description}
            </Paragraph>

            <Row gutter={16} className={styles.detailStats}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="累计调用"
                    value={selectedCapability.callCount}
                    prefix={<ApiOutlined />}
                    suffix="次"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="平均响应"
                    value={selectedCapability.responseTime}
                    prefix={<ClockCircleOutlined />}
                    suffix="ms"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="热度指数"
                    value={Math.floor(selectedCapability.callCount / 10)}
                    prefix={<FireOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions title="基本信息" column={2} className={styles.detailInfo}>
              <Descriptions.Item label="能力ID">{selectedCapability.id}</Descriptions.Item>
              <Descriptions.Item label="能力类型">
                {getTypeLabel(selectedCapability.type)}
              </Descriptions.Item>
              <Descriptions.Item label="所属分类">{selectedCapability.category}</Descriptions.Item>
              <Descriptions.Item label="标签">
                {selectedCapability.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <div className={styles.apiDoc}>
              <Title level={5}>API示例</Title>
              <pre className={styles.codeBlock}>
{`// 调用示例
const response = await mcpClient.call({
  capability: '${selectedCapability.name}',
  params: {
    // 根据具体能力传入参数
  }
});

// 返回示例
{
  "code": 200,
  "data": { ... },
  "message": "success"
}`}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ServiceMarket
