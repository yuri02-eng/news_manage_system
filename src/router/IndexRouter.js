import React, {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useRoutes} from "react-router-dom";
import Login from "../views/login/Login";
import NewsSandBox from "../views/sandbox/NewsSandBox";
import Home from "../views/sandbox/home/Home";
import UserList from "../views/sandbox/user-manage/UserList";
import RoleList from "../views/sandbox/right-manage/RoleList";
import RightList from "../views/sandbox/right-manage/RightList";
import NoPermission from "../views/sandbox/noPermission/NoPermission";
import NewsDraft from "../views/sandbox/news-manage/NewsDraft";
import NewsAdd from "../views/sandbox/news-manage/NewsAdd";
import NewsCategory from "../views/sandbox/news-manage/NewsCategory";
import NewsPreview from "../views/sandbox/news-manage/NewsPreview";
import Audit from "../views/sandbox/audit-manage/Audit";
import AuditList from "../views/sandbox/audit-manage/AuditList";
import Sunset from "../views/sandbox/publish-manage/Sunset";
import Unpublished from "../views/sandbox/publish-manage/Unpublished";
import Published from "../views/sandbox/publish-manage/Published";
import axios from "axios";
import {message} from 'antd';
import NewsUpdate from "../views/sandbox/news-manage/NewsUpdate";
import News from "../views/news/News";
import Detail from "../views/news/Detail";

// 组件名称到组件的映射
const localRouteMap = {
    "/home": Home,
    "/user-manage/list": UserList,
    "/right-manage/role/list": RoleList,
    "/right-manage/right/list": RightList,
    "/news-manage/add": NewsAdd,
    "/news-manage/draft": NewsDraft,
    "/news-manage/category": NewsCategory,
    "/news-manage/preview/:id":NewsPreview,
    "/news-manage/update/:id":NewsUpdate,
    "/audit-manage/audit": Audit,
    "/audit-manage/list": AuditList,
    "/publish-manage/unpublished": Unpublished,
    "/publish-manage/published": Published,
    "/publish-manage/sunset": Sunset,
};

// 增强的认证路由组件
const AuthRoute = ({children}) => {
    const isAuthenticated = !!localStorage.getItem("token");
    return isAuthenticated ? children : <Navigate to="/login" replace/>;
};

// 动态路由渲染器
const DynamicRoutes = ({routeConfig, permissions}) => {
    // 过滤用户有权访问的路由
    const accessibleRoutes = routeConfig.filter(route =>
        permissions.includes(route.key) || route.key === "/home"
    );

    // 将路由配置转换为React Router可用的路由对象
    const routes = [
        {
            path: "/*",
            element: (
                <AuthRoute>
                    <NewsSandBox/>
                </AuthRoute>
            ),
            children: [
                {
                    index: true,
                    element: <Navigate to="home" replace/>
                },
                // 动态路由映射
                ...accessibleRoutes.map(route => ({
                    path: route.key.replace("/", ""), // 移除开头的斜杠
                    element: React.createElement(localRouteMap[route.key] || NoPermission)
                })),
                // 未匹配路由处理
                {
                    path: "*",
                    element: <NoPermission/>
                }
            ]
        }
    ];

    // 使用useRoutes钩子渲染路由
    return useRoutes(routes);
};

export default function IndexRouter() {
    const [routeConfig, setRouteConfig] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 从后端获取路由配置和用户权限
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. 获取路由配置
                const [rightsRes, childrenRes] = await Promise.all([
                    axios.get("http://localhost:8000/rights"),
                    axios.get("http://localhost:8000/children")
                ]);

                // 合并路由配置（假设需要合并）
                const combinedRoutes = [
                    ...rightsRes.data.filter(r => (r.pagepermisson === 1 || r.routepermisson === 1)),
                    ...childrenRes.data.filter(c => (c.pagepermisson === 1 || c.routepermisson === 1))
                ];
                // console.log(combinedRoutes)
                setRouteConfig(combinedRoutes)

                // 2. 获取用户权限
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const tokenData = JSON.parse(token);
                        const userPermissions = tokenData?.role?.rights || [];
                        setPermissions(userPermissions);
                    } catch (e) {
                        console.error("Token解析失败", e);
                        setPermissions([]);
                    }
                } else {
                    setPermissions([]);
                }
            } catch (error) {
                console.error("获取路由配置失败:", error);
                message.error("路由配置加载失败，请刷新重试");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/news" element={<News/>}/>
                <Route path="/detail/:id" element={<Detail/>}/>
                {/* 使用动态路由组件 */}
                <Route path="/*" element={
                    <DynamicRoutes
                        routeConfig={routeConfig}
                        permissions={permissions}
                    />
                }/>
            </Routes>
        </BrowserRouter>
    );
}