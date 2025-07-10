import React from 'react';
import SideMenu from "../../components/sandbox/SideMenu";
import TopHeader from "../../components/sandbox/TopHeader";
import {Outlet} from "react-router-dom";
import {Layout, Spin, theme} from "antd";
    import {useSelector} from "react-redux";
const {Content} = Layout
export default function NewsSandBox() {
    const loading = useSelector(state => state.loading)
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();
    return (
        <Layout style={{height: '100vh'}}>
            {/* 左侧菜单 (始终显示) */}
            <SideMenu/>
            {/* 顶部导航 (始终显示) */}
            <Layout>
                <TopHeader/>

                {/* 内容区域 - 使用 Outlet 渲染嵌套路由 */}
                <Spin size={"large"} spinning={loading}>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            overflowY: "auto"
                        }}
                    >
                        <Outlet></Outlet>
                    </Content>
                </Spin>
            </Layout>
        </Layout>
    )
        ;
}