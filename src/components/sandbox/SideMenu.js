import React, {useEffect, useState, useRef} from 'react'
import Sider from "antd/es/layout/Sider"
import {Menu} from "antd"
import UserOutlined from '@ant-design/icons/UserOutlined'
import VideoCameraOutlined from '@ant-design/icons/VideoCameraOutlined'
import UploadOutlined from '@ant-design/icons/UploadOutlined'
import "./index.css"
import {useNavigate} from "react-router"
import axios from "axios"
import {useLocation} from "react-router-dom"
import {useSelector} from "react-redux";

const iconList = {
    '/home': <UserOutlined/>,
    "/user-manage": <VideoCameraOutlined/>,
    '/user-manage/list': <UserOutlined/>,
    "/right-manage": <UploadOutlined/>,
    '/right-manage/role/list': <UserOutlined/>,
    '/right-manage/right/list': <UserOutlined/>,
}

export default function SideMenu() {
    const collapsed = useSelector(state => state.collapsed)
    // const collapsed = false
    const location = useLocation()
    const navigate = useNavigate()
    const [openKeys, setOpenKeys] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const menuRef = useRef([])

    // 权限检查函数 - 独立于组件渲染
    const checkPermission = (item, rights) => {
        // console.log('检查权限:', item, rights)
        try {
            const validRights = Array.isArray(rights) ? rights : []
            return item.pagepermisson === 1 && validRights.includes(item.key)
        } catch (error) {
            console.error('权限检查错误:', error)
            return false
        }
    }

    // 处理菜单数据 - 独立于组件渲染
    const processMenuData = (menu, rights) => {
        return menu.filter(item => checkPermission(item, rights)).map(item => {
            if (!item.children || item.children.length === 0) {
                return {
                    key: item.key,
                    icon: iconList[item.key] || <UserOutlined/>,
                    label: item.title,
                }
            } else {
                return {
                    key: item.key,
                    icon: iconList[item.key] || <UserOutlined/>,
                    label: item.title,
                    children: processMenuData(item.children, rights),
                }
            }
        })
    }

    // 一次性数据获取
    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const {data} = await axios.get("http://localhost:8000/rights?_embed=children")

                // 从 localStorage 获取权限数据
                const token = JSON.parse(localStorage.getItem("token"))
                // console.log(token)
                const rights = token?.role?.rights || []
                const processedMenu = processMenuData(data, rights)
                setMenuItems(processedMenu)
                menuRef.current = processedMenu
            } catch (error) {
                console.error('获取菜单失败:', error)
                // 设置空菜单作为回退
                setMenuItems([])
            }
        }

        fetchMenuData()
    }, []) // 空依赖数组，只运行一次

    // 处理当前路径
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean)
        if (pathSegments.length > 1) {
            setOpenKeys([`/${pathSegments[0]}`])
        }
    }, [location.pathname])

    const handleMenuClick = ({key}) => {
        navigate(key)
    }

    const handleOpenChange = (keys) => {
        const latestOpenKey = keys.find(key => !openKeys.includes(key))

        // 只保留一个父菜单展开
        if (latestOpenKey) {
            setOpenKeys([latestOpenKey])
        } else {
            setOpenKeys([])
        }
    }

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} breakpoint style={{height: "100vh"}}>
            <div style={{display: "flex", height: "100%", flexDirection: "column"}}>
                <div className="logo" style={{color: "white"}}>全球新闻发布管理系统</div>
                <div className="side-menu-scroll">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems.length > 0 ? menuItems : menuRef.current}
                        onClick={handleMenuClick}
                        openKeys={openKeys}
                        onOpenChange={handleOpenChange}
                    />
                </div>
            </div>
        </Sider>
    )
}