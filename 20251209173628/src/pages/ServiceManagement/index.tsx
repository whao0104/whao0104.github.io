import { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Drawer,
  Modal,
  message,
  Typography,
  Tabs,
  Descriptions,
  Alert,
  Divider,
} from 'antd'
import {
  ApiOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  PoweroffOutlined,
  CopyOutlined,
  SendOutlined,
} from '@ant-design/icons'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { mockServices, generateMonitorData, mockCapabilities, mockAlbums } from '../../data/mockData'
import type { MCPService } from '../../types'
import styles from './index.module.css'

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer,
])

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography

const ServiceManagement = () => {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<MCPService | null>(null)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [monitorDrawerVisible, setMonitorDrawerVisible] = useState(false)
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [testMessages, setTestMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [testInput, setTestInput] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  // 过滤服务
  const filteredServices = mockServices.filter(service => {
    const matchSearch =
      service.name.includes(searchText) || service.description.includes(searchText)
    const matchStatus = statusFilter === 'all' || service.status === statusFilter
    return matchSearch && matchStatus
  })

  // 统计数据
  const totalServices = mockServices.length
  const todayCallCount = mockServices.reduce((sum, s) => sum + s.callCount, 0)
  const successRate = (
    mockServices.reduce((sum, s) => sum + (100 - s.errorRate), 0) / mockServices.length
  ).toFixed(2)
  const avgResponseTime = Math.floor(
    mockServices.reduce((sum, s) => sum + s.avgResponseTime, 0) / mockServices.length
  )

  const getStatusTag = (status: MCPService['status']) => {
    const config = {
      active: { color: 'success', text: '运行中' },
      inactive: { color: 'default', text: '已停用' },
      testing: { color: 'warning', text: '测试中' },
    }
    const { color, text } = config[status]
    return <Tag color={color}>{text}</Tag>
  }

  // 测试功能：发送消息
  const handleSendTestMessage = async () => {
    if (!testInput.trim()) return
    
    const userMessage = testInput.trim()
    setTestInput('')
    setTestMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    setTestLoading(true)
    // 模拟AI响应
    setTimeout(() => {
      const mockResponse = `已收到您的测试消息："${userMessage}"。\n\n这是模拟的MCP服务响应。实际环境中，这里会调用真实的服务接口，基于已配置的实体范围和原子能力返回相应的数据。\n\n服务名称：${selectedService?.name}\n调用能力：${selectedService?.capabilities.length}个\n响应时间：${selectedService?.avgResponseTime}ms`
      
      setTestMessages(prev => [...prev, { role: 'assistant', content: mockResponse }])
      setTestLoading(false)
    }, 1500)
  }

  // 复制文本到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  }

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: MCPService['status']) => getStatusTag(status),
    },
    {
      title: '调用次数',
      dataIndex: 'callCount',
      key: 'callCount',
      width: 120,
      sorter: (a: MCPService, b: MCPService) => a.callCount - b.callCount,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '成功率',
      dataIndex: 'errorRate',
      key: 'successRate',
      width: 100,
      sorter: (a: MCPService, b: MCPService) => a.errorRate - b.errorRate,
      render: (errorRate: number) => {
        const successRate = 100 - errorRate
        return (
          <span style={{ color: successRate >= 99 ? '#52c41a' : successRate >= 95 ? '#faad14' : '#ff4d4f' }}>
            {successRate.toFixed(1)}%
          </span>
        )
      },
    },
    {
      title: '平均响应',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      width: 120,
      sorter: (a: MCPService, b: MCPService) => a.avgResponseTime - b.avgResponseTime,
      render: (time: number) => `${time}ms`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: MCPService) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => {
              setSelectedService(record)
              setDetailDrawerVisible(true)
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => {
              setSelectedService(record)
              setMonitorDrawerVisible(true)
            }}
          >
            监控
          </Button>
          <Button
            type="link"
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => {
              setSelectedService(record)
              setTestMessages([])
              setTestModalVisible(true)
            }}
          >
            测试
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<PoweroffOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认下线',
                content: `确定要下线服务「${record.name}」吗？下线后将无法继续调用。`,
                okText: '确认下线',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: () => message.success('服务已下线'),
              })
            }}
          >
            下线
          </Button>
        </Space>
      ),
    },
  ]

  // 监控图表配置
  const monitorData = generateMonitorData(7)
  const chartOption = {
    title: {
      text: '调用趋势（最近7天）',
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['调用量', '错误数', '响应时间'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: monitorData.map(d => d.time),
    },
    yAxis: [
      {
        type: 'value',
        name: '调用量/错误数',
      },
      {
        type: 'value',
        name: '响应时间(ms)',
      },
    ],
    series: [
      {
        name: '调用量',
        type: 'line',
        data: monitorData.map(d => d.callCount),
        smooth: true,
      },
      {
        name: '错误数',
        type: 'line',
        data: monitorData.map(d => d.errorCount),
        smooth: true,
      },
      {
        name: '响应时间',
        type: 'line',
        yAxisIndex: 1,
        data: monitorData.map(d => d.avgResponseTime),
        smooth: true,
      },
    ],
  }

  // 获取服务的能力列表
  const getServiceCapabilities = (service: MCPService) => {
    return service.capabilities.map(capId => {
      const cap = mockCapabilities.find(c => c.id === capId)
      return cap || { id: capId, name: '未知能力', type: 'table' as const }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>服务管理</Title>
        <Text type="secondary">
          管理MCP服务的全生命周期，监控调用情况，控制访问权限
        </Text>
      </div>

      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="服务总数"
              value={totalServices}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日调用"
              value={todayCallCount}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均成功率"
              value={successRate}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均响应"
              value={avgResponseTime}
              prefix={<ClockCircleOutlined />}
              suffix="ms"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <Space>
            <Search
              placeholder="搜索服务名称或描述"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">全部状态</Option>
              <Option value="active">运行中</Option>
              <Option value="testing">测试中</Option>
              <Option value="inactive">已停用</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="服务详情"
        placement="right"
        width={720}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedService && (
          <Tabs
            defaultActiveKey="config"
            items={[
              {
                key: 'config',
                label: '服务配置',
                children: (
                  <div className={styles.detailContent}>
                    <Alert
                      message="服务配置信息"
                      description="以下是该MCP服务的完整配置信息和密钥"
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />

                    <Title level={5}>基础配置</Title>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                      <Descriptions.Item label="服务名称">{selectedService.name}</Descriptions.Item>
                      <Descriptions.Item label="服务描述">{selectedService.description}</Descriptions.Item>
                      <Descriptions.Item label="服务状态">{getStatusTag(selectedService.status)}</Descriptions.Item>
                      <Descriptions.Item label="创建时间">{selectedService.createdAt}</Descriptions.Item>
                      <Descriptions.Item label="创建人">{selectedService.creator}</Descriptions.Item>
                    </Descriptions>

                    <Title level={5}>密钥信息</Title>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                      <Descriptions.Item label="AppKey">
                        <Space>
                          <code>mcp_{selectedService.id}_app_key_demo</code>
                          <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(`mcp_${selectedService.id}_app_key_demo`)}
                          >
                            复制
                          </Button>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="AppSecret">
                        <Space>
                          <code>•••••••••••••••••••••••••••</code>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => message.info('请联系管理员获取完整密钥')}
                          >
                            查看
                          </Button>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="API Endpoint">
                        <Space>
                          <code>https://api.mcp-platform.com/v1/services/{selectedService.id}</code>
                          <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(`https://api.mcp-platform.com/v1/services/${selectedService.id}`)}
                          >
                            复制
                          </Button>
                        </Space>
                      </Descriptions.Item>
                    </Descriptions>

                    <Title level={5}>实体范围</Title>
                    <Card size="small" style={{ marginBottom: 24 }}>
                      {selectedService.entityScope.type === 'album' ? (
                        (() => {
                          const album = mockAlbums.find(a => a.id === selectedService.entityScope.value)
                          return album ? (
                            <div>
                              <Text strong>专辑：</Text>
                              <Text>{album.name}</Text>
                              <br />
                              <Text type="secondary">{album.description}</Text>
                              <br />
                              <Text type="secondary">包含 {album.entityCount} 个实体</Text>
                            </div>
                          ) : (
                            <Text>专辑信息不存在</Text>
                          )
                        })()
                      ) : (
                        <div>
                          <Text strong>规则筛选</Text>
                          <br />
                          <Text type="secondary">自定义规则配置</Text>
                        </div>
                      )}
                    </Card>

                    <Title level={5}>原子能力清单</Title>
                    <div className={styles.capabilityList}>
                      {getServiceCapabilities(selectedService).map((cap, index) => (
                        <Card key={cap.id} size="small" style={{ marginBottom: 8 }}>
                          <Space>
                            <Tag color="blue">{index + 1}</Tag>
                            <Text strong>{cap.name}</Text>
                          </Space>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'usage',
                label: '使用说明',
                children: (
                  <div className={styles.usageContent}>
                    <Alert
                      message="快速接入指南"
                      description="选择适合您的接入方式，快速集成MCP服务"
                      type="success"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />

                    <Title level={5}>方式一：CodeBuddy AI编程工具</Title>
                    <Card size="small" style={{ marginBottom: 24 }}>
                      <Text strong>1. 打开CodeBuddy配置</Text>
                      <pre className={styles.codeBlock}>
{`打开 Settings → MCP Servers → Add Server`}
                      </pre>

                      <Text strong>2. 添加服务配置</Text>
                      <pre className={styles.codeBlock}>
{`{
  "name": "${selectedService?.name}",
  "type": "http",
  "url": "https://api.mcp-platform.com/v1/services/${selectedService?.id}",
  "headers": {
    "X-AppKey": "mcp_${selectedService?.id}_app_key_demo",
    "X-AppSecret": "your_secret_here"
  }
}`}
                      </pre>
                      <Button
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={() => copyToClipboard(`{"name":"${selectedService?.name}","type":"http","url":"https://api.mcp-platform.com/v1/services/${selectedService?.id}","headers":{"X-AppKey":"mcp_${selectedService?.id}_app_key_demo","X-AppSecret":"your_secret_here"}}`)}
                      >
                        复制配置
                      </Button>

                      <Divider />

                      <Text strong>3. 重启CodeBuddy生效</Text>
                      <br />
                      <Text type="secondary">配置完成后，重启CodeBuddy即可使用该MCP服务</Text>
                    </Card>

                    <Title level={5}>方式二：自定义Agent集成</Title>
                    <Card size="small" style={{ marginBottom: 24 }}>
                      <Text strong>HTTP调用示例</Text>
                      <pre className={styles.codeBlock}>
{`POST https://api.mcp-platform.com/v1/services/${selectedService?.id}/invoke
Content-Type: application/json
X-AppKey: mcp_${selectedService?.id}_app_key_demo
X-AppSecret: your_secret_here

{
  "capability": "getTableSchema",
  "params": {
    "tableName": "user_info"
  }
}`}
                      </pre>
                      <Button
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={() => copyToClipboard(`POST https://api.mcp-platform.com/v1/services/${selectedService?.id}/invoke\nContent-Type: application/json\nX-AppKey: mcp_${selectedService?.id}_app_key_demo\nX-AppSecret: your_secret_here\n\n{\n  "capability": "getTableSchema",\n  "params": {\n    "tableName": "user_info"\n  }\n}`)}
                      >
                        复制示例
                      </Button>

                      <Divider />

                      <Text strong>Python SDK示例</Text>
                      <pre className={styles.codeBlock}>
{`from mcp_client import MCPClient

client = MCPClient(
    app_key="mcp_${selectedService?.id}_app_key_demo",
    app_secret="your_secret_here"
)

result = client.invoke(
    service_id="${selectedService?.id}",
    capability="getTableSchema",
    params={"tableName": "user_info"}
)
print(result)`}
                      </pre>
                      <Button
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={() => copyToClipboard(`from mcp_client import MCPClient\n\nclient = MCPClient(\n    app_key="mcp_${selectedService?.id}_app_key_demo",\n    app_secret="your_secret_here"\n)\n\nresult = client.invoke(\n    service_id="${selectedService?.id}",\n    capability="getTableSchema",\n    params={"tableName": "user_info"}\n)\nprint(result)`)}
                      >
                        复制代码
                      </Button>
                    </Card>

                    <Title level={5}>更多资源</Title>
                    <Card size="small">
                      <Space direction="vertical">
                        <Button type="link" size="small">📖 完整API文档</Button>
                        <Button type="link" size="small">💻 SDK下载中心</Button>
                        <Button type="link" size="small">🎓 集成教程视频</Button>
                        <Button type="link" size="small">💬 技术支持社区</Button>
                      </Space>
                    </Card>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Drawer>

      {/* 监控详情抽屉 */}
      <Drawer
        title="服务监控详情"
        placement="right"
        width={720}
        onClose={() => setMonitorDrawerVisible(false)}
        open={monitorDrawerVisible}
      >
        {selectedService && (
          <div className={styles.monitorContent}>
            <div className={styles.serviceInfo}>
              <Title level={4}>{selectedService.name}</Title>
              <Text type="secondary">{selectedService.description}</Text>
            </div>

            <Row gutter={16} className={styles.monitorStats}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="累计调用"
                    value={selectedService.callCount}
                    prefix={<ApiOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="错误率"
                    value={selectedService.errorRate}
                    suffix="%"
                    prefix={<WarningOutlined />}
                    valueStyle={{
                      color: selectedService.errorRate > 1 ? '#ff4d4f' : '#52c41a',
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="平均响应"
                    value={selectedService.avgResponseTime}
                    suffix="ms"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <div className={styles.chartContainer}>
              <ReactEChartsCore
                echarts={echarts}
                option={chartOption}
                style={{ height: '350px' }}
              />
            </div>

            <div className={styles.logSection}>
              <Title level={5}>最近调用日志</Title>
              <Table
                size="small"
                dataSource={[
                  {
                    key: '1',
                    time: '2024-12-09 14:23:15',
                    user: '张三',
                    status: 'success',
                    duration: '85ms',
                  },
                  {
                    key: '2',
                    time: '2024-12-09 14:22:48',
                    user: '李四',
                    status: 'success',
                    duration: '92ms',
                  },
                  {
                    key: '3',
                    time: '2024-12-09 14:21:33',
                    user: '王五',
                    status: 'error',
                    duration: '150ms',
                  },
                ]}
                columns={[
                  { title: '时间', dataIndex: 'time', key: 'time' },
                  { title: '用户', dataIndex: 'user', key: 'user' },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'success' ? 'success' : 'error'}>
                        {status === 'success' ? '成功' : '失败'}
                      </Tag>
                    ),
                  },
                  { title: '耗时', dataIndex: 'duration', key: 'duration' },
                ]}
                pagination={false}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* 测试功能模态框 */}
      <Modal
        title={`测试服务 - ${selectedService?.name}`}
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false)
          setTestMessages([])
          setTestInput('')
        }}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
      >
        <div className={styles.testContainer}>
          <div className={styles.testMessages}>
            {testMessages.length === 0 ? (
              <div className={styles.emptyTest}>
                <ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">发送消息开始测试MCP服务</Text>
              </div>
            ) : (
              testMessages.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}>
                  <div className={styles.messageContent}>
                    <Text strong>{msg.role === 'user' ? '你' : 'MCP服务'}</Text>
                    <pre className={styles.messageText}>{msg.content}</pre>
                  </div>
                </div>
              ))
            )}
            {testLoading && (
              <div className={styles.assistantMessage}>
                <div className={styles.messageContent}>
                  <Text strong>MCP服务</Text>
                  <Text type="secondary">正在处理...</Text>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.testInput}>
            <Input.TextArea
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              placeholder="输入测试消息，例如：查询user_info表的结构"
              autoSize={{ minRows: 2, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSendTestMessage()
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendTestMessage}
              loading={testLoading}
              disabled={!testInput.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ServiceManagement
