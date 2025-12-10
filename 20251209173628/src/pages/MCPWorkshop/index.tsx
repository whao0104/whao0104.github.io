import { useState } from 'react'
import { Tabs, Typography } from 'antd'
import { ThunderboltOutlined, ToolOutlined } from '@ant-design/icons'
import QuickGenerate from './QuickGenerate'
import AdvancedBuilder from './AdvancedBuilder'
import styles from './index.module.css'

const { Title, Text } = Typography

const MCPWorkshop = () => {
  const [activeTab, setActiveTab] = useState('quick')

  const items = [
    {
      key: 'quick',
      label: (
        <span>
          <ThunderboltOutlined />
          快速生成
        </span>
      ),
      children: <QuickGenerate />,
    },
    {
      key: 'advanced',
      label: (
        <span>
          <ToolOutlined />
          精细化选择
        </span>
      ),
      children: <AdvancedBuilder />,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>MCP工坊</Title>
        <Text type="secondary">
          选择预设模板快速生成，或通过可视化画布精细化构建您的专属MCP服务
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
        className={styles.tabs}
      />
    </div>
  )
}

export default MCPWorkshop
