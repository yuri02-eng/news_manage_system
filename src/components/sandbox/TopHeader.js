import React, {useState, useEffect} from 'react';
import {Avatar, Button, Dropdown, Popconfirm, theme, Layout, Spin} from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    PoweroffOutlined,
    UserOutlined,
    BellOutlined,
    GlobalOutlined,
    SettingOutlined
} from "@ant-design/icons";
import styles from './TopHeader.module.css';
import {useSelector} from "react-redux";
import {changeCollapsed} from "../../redux/reducers/CollapsedReducer";
import {useDispatch} from "react-redux";

const {Header} = Layout;

export default function TopHeader() {
    const collapsed = useSelector(state => state.collapsed)
    // const collapsed = false
    // console.log(collapsed)
    const dispatch = useDispatch();
    const [notificationCount, setNotificationCount] = useState(0);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const {
        token: {colorBgContainer},
    } = theme.useToken();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const parsedToken = JSON.parse(token);
            setUserData({
                role: parsedToken.role?.roleName || "未分配角色",
                username: parsedToken.users?.username || "未知用户"
            });
            setNotificationCount(parsedToken.notificationCount || 0);
        } catch (error) {
            console.error("解析用户令牌失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 6) return "凌晨好";
        if (hour < 12) return "早上好";
        if (hour < 14) return "中午好";
        if (hour < 18) return "下午好";
        return "晚上好";
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: (
                <div className={styles.userInfoDropdown}>
                    <div className={styles.userInfo}>
                        <Avatar
                            size={48}
                            icon={<UserOutlined/>}
                            className={styles.userAvatar}
                            style={{backgroundColor: '#1890ff'}}
                        />
                        <div className={styles.userRole}>{userData?.role || "无角色信息"}</div>
                    </div>
                </div>
            ),
            className: styles.userInfoItem
        },
        {
            key: 'profile-page',
            label: (
                <a href="#">
                    <UserOutlined className={styles.dropdownIcon}/>
                    <span>个人中心</span>
                </a>
            ),
        },
        {
            key: 'settings',
            label: (
                <a href="#">
                    <SettingOutlined className={styles.dropdownIcon}/>
                    <span>系统设置</span>
                </a>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            danger: true,
            label: (
                <Popconfirm
                    title="确定要退出登录吗？"
                    onConfirm={handleLogout}
                    okText="确定"
                    cancelText="取消"
                >
                    <div className={styles.logoutContainer}>
                        <PoweroffOutlined className={styles.dropdownIcon}/>
                        <span>退出系统</span>
                    </div>
                </Popconfirm>
            ),
        },
    ];

    if (loading) {
        return (
            <Header className={styles.topHeader} style={{background: colorBgContainer}}>
                <div className={styles.headerContainer}>
                    <div className={styles.headerLeft}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            className={styles.collapseBtn}
                            disabled
                        />
                        <Spin tip="加载中...">
                            <span className={styles.welcomeText}>加载用户信息中...</span>
                        </Spin>
                    </div>
                </div>
            </Header>
        );
    }

    if (!userData) {
        return (
            <Header className={styles.topHeader} style={{background: colorBgContainer}}>
                <div className={styles.headerContainer}>
                    <div className={styles.headerLeft}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                            onClick={() => {
                                dispatch(changeCollapsed());
                            }}
                            className={styles.collapseBtn}
                        />
                        <span className={styles.welcomeText}>全球新闻管理系统</span>
                    </div>

                    <div className={styles.headerRight}>
                        <Button
                            type="primary"
                            icon={<UserOutlined/>}
                            onClick={() => window.location.href = "/login"}
                        >
                            登录
                        </Button>
                    </div>
                </div>
            </Header>
        );
    }

    return (
        <Header className={styles.topHeader} style={{background: colorBgContainer}}>
            <div className={styles.headerContainer}>
                <div className={styles.headerLeft}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => {
                            dispatch(changeCollapsed())
                        }}
                        className={styles.collapseBtn}
                    />
                    <span className={styles.welcomeText}>
            {getTimeOfDay()}，{userData.username}，欢迎使用全球新闻管理系统
          </span>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.actionBtn} onClick={() => console.log('通知中心')}>
                        <BellOutlined/>
                        {notificationCount > 0 && (
                            <span className={styles.notificationBadge}>{notificationCount}</span>
                        )}
                    </div>

                    <div className={styles.actionBtn} onClick={() => console.log('语言切换')}>
                        <GlobalOutlined/>
                    </div>

                    <Dropdown
                        menu={{items: userMenuItems}}
                        trigger={['click']}
                        overlayClassName={styles.userDropdownMenu}
                    >
                        <div className={styles.userAvatarContainer}>
                            <Avatar
                                size={32}
                                icon={<UserOutlined/>}
                                className={styles.headerAvatar}
                                style={{backgroundColor: '#1890ff'}}
                            />
                            <span className={styles.username}>{userData.username}</span>
                            {/*<div className={styles.userInfo}>*/}
                            {/*  <span className={styles.username}>{userData.username}</span>*/}
                            {/*  <span className={styles.role}>{userData.role}</span>*/}
                            {/*</div>*/}
                        </div>
                    </Dropdown>
                </div>
            </div>
        </Header>
    );
}