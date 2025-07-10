import React, {useMemo, useCallback, useEffect, useState} from 'react';
import axios from "axios";
import {Button, notification, Table, Tag} from "antd";
import {Link} from 'react-router-dom';

// 常量提取到外部避免每次渲染重新创建
const AUDIT_STATES = {
    0: '未审核',
    1: '审核中',
    2: '已拒绝',
    3: '已通过'
};

const AUDIT_COLORS = {
    0: '',
    1: 'orange',
    2: 'red',
    3: 'green'
};

export default function Audit() {
    // 安全的从localStorage获取token并解析
    const userData = useMemo(() => {
        const token = localStorage.getItem('token');
        try {
            return token ? JSON.parse(token) : {role: {}, users: {}};
        } catch {
            return {role: {}, users: {}};
        }
    }, []);
    const {role: {id: roleId} = {}, users = {}} = userData;
    const userRegion = users?.region || '';
    const username = users?.username || '';

    const [dataSource, setDataSource] = useState([]);
    const [categoryMap, setCategoryMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 封装API请求
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [newsResponse, categoriesResponse] = await Promise.all([
                axios.get(`/news?auditState=1`),
                axios.get(`/categories`)
            ]);

            // 创建类别映射
            const categories = categoriesResponse.data;
            const categoryObj = {};
            categories.forEach(category => {
                categoryObj[category.id] = category.title;
            });
            setCategoryMap(categoryObj);

            // 处理新闻数据
            let newsData = newsResponse.data.map(item => ({
                ...item,
                key: item.id,
                categoryName: categoryObj[item.categoryId] || '未知类别'
            }));

            // 根据角色过滤数据
            if (roleId === "1") {
                // 超级管理员 - 所有新闻
                setDataSource(newsData);
            } else {
                // 区域管理员 - 自己创建的 + 同区域的其他编辑创建的
                setDataSource([
                    ...newsData.filter(news => news.author === username),
                    ...newsData.filter(news => news.region === userRegion && news.author !== username)
                ]);
            }
        } catch (err) {
            setError('加载数据失败，请重试');
            console.error('数据加载错误:', err);
        } finally {
            setLoading(false);
        }
    }, [roleId, userRegion, username]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 审核操作
    const handleAudit = useCallback(async (item, newState) => {
        try {
            setLoading(true);
            await axios.patch(`/news/${item.id}`, {
                auditState: newState,
                publishState:1
            });
            notification.info({
                message: '操作成功',
                description: `新闻《${item.title}》审核状态已更新为${AUDIT_STATES[newState]}`
            })
            // 成功后更新本地状态
            setDataSource(prevData =>
                prevData.filter(news =>
                    news.id !== item.id
                )
            );
        } catch (err) {
            console.error('审核操作失败:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 表格列配置
    const columns = useMemo(() => [
        {
            title: '新闻标题',
            dataIndex: 'title',
            key: 'title',
            render: (title, item) => (
                <Link to={`/news-manage/preview/${item.id}`}>{title}</Link>
            )
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: '新闻分类',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (_, item) => item.categoryName
        },
        {
            title: '审核状态',
            dataIndex: 'auditState',
            key: 'auditState',
            render: state => (
                <Tag color={AUDIT_COLORS[state]}>{AUDIT_STATES[state]}</Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, item) => (
                <div>
                    <Button
                        type="primary"
                        onClick={() => handleAudit(item, 2)}
                        disabled={item.auditState === 2}
                    >
                        通过
                    </Button>
                    <Button
                        danger
                        onClick={() => handleAudit(item, 3)}
                        style={{marginLeft: 8}}
                        disabled={item.auditState === 3}
                    >
                        拒绝
                    </Button>
                </div>
            )
        }
    ], [handleAudit]);

    // 显示错误状态
    if (error) {
        return (
            <div style={{textAlign: 'center', padding: '50px'}}>
                <h3>{error}</h3>
                <Button type="primary" onClick={fetchData}>重试</Button>
            </div>
        );
    }

    return (
        <div>
            <Table
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20']
                }}
                rowKey="id"
                locale={{emptyText: '暂无待审核新闻'}}
            />
        </div>
    );
}