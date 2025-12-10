import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
  ShopOutlined,
  ToolOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  CompassOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import styles from './MainLayout.module.css'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // 确定当前激活的模块
  const activeModule = useMemo(() => {
    if (location.pathname.startsWith('/explorer')) return 'metadata'
    if (
      location.pathname.startsWith('/market') ||
      location.pathname.startsWith('/workshop') ||
      location.pathname.startsWith('/management')
    ) {
      return 'mcp'
    }
    return 'metadata'
  }, [location.pathname])

  // 横向导航菜单（顶部）
  const topMenuItems: MenuProps['items'] = [
    {
      key: 'metadata',
      icon: <CompassOutlined />,
      label: '元数据解读',
    },
    {
      key: 'mcp',
      icon: <ShopOutlined />,
      label: 'MCP市场',
    },
  ]

  // 侧边栏菜单（根据模块动态变化）
  const sideMenuItems: MenuProps['items'] = useMemo(() => {
    if (activeModule === 'metadata') {
      return [
        {
          key: '/explorer',
          icon: <SearchOutlined />,
          label: '智能解读',
        },
      ]
    } else {
      return [
        {
          key: '/market',
          icon: <ShopOutlined />,
          label: '服务市场',
        },
        {
          key: '/workshop',
          icon: <ToolOutlined />,
          label: 'MCP工坊',
        },
        {
          key: '/management',
          icon: <SettingOutlined />,
          label: '服务管理',
        },
      ]
    }
  }, [activeModule])

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleTopMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'metadata') {
      navigate('/explorer')
    } else if (key === 'mcp') {
      navigate('/market')
    }
  }

  const handleSideMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout className={styles.layout}>
      {/* 顶部横向导航 */}
      <Header className={styles.topHeader}>
        <div className={styles.topHeaderContent}>
          <div className={styles.logoSection}>
            <CompassOutlined className={styles.platformIcon} />
            <span className={styles.platformName}>数据发现</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[activeModule]}
            items={topMenuItems}
            onClick={handleTopMenuClick}
            className={styles.topMenu}
          />
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} />
                <span>管理员</span>
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* 主体布局 */}
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={styles.sider}
          width={220}
          collapsedWidth={60}
        >
          <div className={styles.siderHeader}>
            <div className={styles.moduleTitle}>
              {activeModule === 'metadata' ? '元数据解读' : 'MCP市场'}
            </div>
            <div
              className={styles.collapseBtn}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '»' : '«'}
            </div>
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={sideMenuItems}
            onClick={handleSideMenuClick}
            className={styles.sideMenu}
          />
        </Sider>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
