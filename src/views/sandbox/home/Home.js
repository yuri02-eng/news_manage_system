import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Avatar, Badge, Button, Card, Col, Divider, Drawer, List, Row, Spin, Typography} from "antd";
import {BarChartOutlined, EditOutlined, EyeOutlined, LikeOutlined, SettingOutlined} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import axios from "axios";
import * as echarts from "echarts";
import _ from "lodash";

const {Title, Text} = Typography;

// 提取可复用组件：新闻列表项
const NewsListItem = React.memo(({item, type}) => (
    <List.Item key={item.id} style={{padding: '8px 0'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
            <Text ellipsis style={{width: '70%'}}>
                <a href={`/news-manage/preview/${item.id}`}>{item.title}</a>
            </Text>
            <Badge
                count={type === 'view' ? (item.view || 0) : (item.star || 0)}
                overflowCount={9999}
                style={{backgroundColor: type === 'view' ? '#1890ff' : '#ff4d4f'}}
            />
        </div>
    </List.Item>
));

// 图表卡片组件
const ChartCard = ({title, icon, children, style}) => (
    <Card
        title={
            <span style={{fontSize: 16}}>
        {icon}
                <strong>{title}</strong>
      </span>
        }
        headStyle={{
            backgroundColor: '#f9f9f9',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 16px',
            borderRadius: '8px 8px 0 0'
        }}
        bodyStyle={{padding: '16px'}}
        style={{
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            height: '100%',
            ...style
        }}
    >
        {children}
    </Card>
);

// 统计卡片组件
const StatCard = ({title, data, type, icon}) => (
    <ChartCard
        title={title}
        icon={icon}
    >
        <List
            size="small"
            dataSource={data}
            renderItem={(item) => <NewsListItem item={item} type={type}/>}
        />
    </ChartCard>
);

// 初始化ECharts实例
const initChart = (containerRef, chartInstanceRef) => {
    if (!containerRef.current) return;
    // 检查并复用现有实例
    if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(containerRef.current);
    }

    return chartInstanceRef.current;
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
    try {
        const [viewsRes, likesRes, newsRes] = await Promise.all([
            axios.get('/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6'),
            axios.get('/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6'),
            axios.get('/news?publishState=2&_expand=category')
        ]);

        return {
            viewList: viewsRes.data,
            likeList: likesRes.data,
            newsList: newsRes.data
        };
    } catch (error) {
        console.error("数据获取失败:", error);
        throw error;
    }
}

// 处理分类统计数据
const processCategoryStats = (newsList) => {
    const groupedData = _.groupBy(newsList, item => item.category?.title || '未分类');
    return Object.keys(groupedData).map(category => ({
        name: category,
        value: groupedData[category].length
    }));
};

export default function Dashboard() {
    const [open, setOpen] = useState(false);
    const tokenData = JSON.parse(localStorage.getItem("token") || "{}");
    const {role = {}, users = {}} = tokenData;

    const [isLoading, setIsLoading] = useState(true);
    const [viewList, setViewList] = useState([]);
    const [likeList, setLikeList] = useState([]);
    const [newsList, setNewsList] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [error, setError] = useState(null);

    // 图表实例引用
    const barChartRef = useRef(null);
    const barChartInstance = useRef(null);
    const pieChartRef = useRef(null);
    const pieChartInstance = useRef(null);
    const drawerPieRef = useRef(null);
    const drawerPieInstance = useRef(null);

    const showDrawer = () => setOpen(true);
    const onClose = () => setOpen(false);

    // 计算新闻占比
    const newsRatio = useMemo(() => {
        if (!categoryStats || categoryStats.length === 0) return [];

        const total = categoryStats.reduce((sum, curr) => sum + curr.value, 0);
        return categoryStats.map(item => ({
            ...item,
            percent: Math.round((item.value / total) * 100)
        }));
    }, [categoryStats]);

    // 主数据获取
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchDashboardData();

                setViewList(data.viewList);
                setLikeList(data.likeList);
                setNewsList(data.newsList)
                // 处理分类统计
                const stats = processCategoryStats(data.newsList);
                setCategoryStats(stats);

                // 渲染图表
                renderBarChart(stats);
                renderPieChart(stats);
            } catch (err) {
                console.error("数据加载失败:", err);
                setError("数据加载失败，请稍后重试");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // 渲染柱状图
    const renderBarChart = useCallback((data) => {
        const chart = initChart(barChartRef, barChartInstance);
        if (!chart) return;

        const sortedData = [...data].sort((a, b) => b.value - a.value);

        const option = {
            title: {
                text: '新闻分类统计',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: {c}篇'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '8%',
                top: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: sortedData.map(item => item.name),
                axisLine: {show: true, lineStyle: {color: '#ccc'}},
                axisTick: {show: false},
                axisLabel: {
                    interval: 0,
                    rotate: sortedData.length > 5 ? 30 : 0,
                    margin: 10
                },
                z: 10
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                name: '数量（篇）',
                nameTextStyle: {padding: [0, 0, 0, 40]}
            },
            series: [{
                name: '数量',
                type: 'bar',
                data: sortedData.map(item => item.value),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {offset: 0, color: '#83bff6'},
                        {offset: 1, color: '#188df0'}
                    ]),
                    borderRadius: [6, 6, 0, 0],
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowBlur: 4,
                    shadowOffsetY: 2
                },
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'top',
                    distance: 10,
                    color: '#1890ff',
                    fontWeight: 'bold',
                    formatter: '{c}'
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 0, color: '#83bff6'},
                            {offset: 1, color: '#0050b3'}
                        ]),
                    }
                }
            }]
        };

        chart.setOption(option);
    }, []);

    // 渲染饼图
    const renderPieChart = useCallback((data) => {
        const chart = initChart(pieChartRef, pieChartInstance);
        if (!chart) return;

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}篇 ({d}%)'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                data: data.map(item => item.name)
            },
            series: [{
                name: '新闻分类',
                type: 'pie',
                radius: ['50%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '14',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: {
                        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
                    }
                }))
            }]
        };

        chart.setOption(option);
    }, []);

    // 渲染抽屉中的饼图
    const renderDrawerPieChart = useCallback(() => {
        console.log(newsList)
        const chart = initChart(drawerPieRef, drawerPieInstance);
        const currentList = newsList.filter(item => item.author === users.username)
        const groupObj = _.groupBy(currentList, item => item.category.title)
        const perNews=Object.keys(groupObj).map(category => ({
        name: category,
        value: groupObj[category].length
    }))
        if (!chart) return;
        // 使用仪表盘数据的简化版本，实际应获取不同数据
        const option = {
            title: {
                text: '当前用户新闻分类图示',
                // subtext: '示例数据',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: perNews,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        chart.setOption(option);
    }, [newsList]);

    // 抽屉打开时渲染饼图
    useEffect(() => {
        if (open) {
            renderDrawerPieChart();
        }
    }, [open, renderDrawerPieChart]);

    // 窗口大小调整处理
    useEffect(() => {
        const resizeCharts = _.debounce(() => {
            barChartInstance.current?.resize();
            pieChartInstance.current?.resize();
            drawerPieInstance.current?.resize();
        }, 300);

        window.addEventListener('resize', resizeCharts);

        return () => {
            window.removeEventListener('resize', resizeCharts);
        };
    }, []);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            barChartInstance.current?.dispose();
            pieChartInstance.current?.dispose();
            drawerPieInstance.current?.dispose();
        };
    }, []);

    // 用户信息卡片渲染
    const userCard = useMemo(() => (
        <Card
            cover={
                <div style={{
                    height: 120,
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 18,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)'
                    }}/>
                    <div style={{
                        zIndex: 1,
                        textAlign: 'center',
                        padding: '0 20px'
                    }}>
                        <Title level={4} style={{color: 'white', marginBottom: 4}}>欢迎回来</Title>
                        <Text style={{color: 'rgba(255,255,255,0.9)'}}>
                            今日新增新闻：{viewList.length + likeList.length}篇
                        </Text>
                    </div>
                </div>
            }
            actions={[
                <div key="actions" onClick={showDrawer}>
                    <SettingOutlined style={{fontSize: 16}}/>
                    <span style={{marginLeft: 8}}>设置</span>
                </div>,
                <div key="edit">
                    <EditOutlined style={{fontSize: 16}}/>
                    <span style={{marginLeft: 8}}>编辑</span>
                </div>,
                <div key="chart">
                    <BarChartOutlined style={{fontSize: 16}}/>
                    <span style={{marginLeft: 8}}>报表</span>
                </div>
            ]}
            style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderRadius: 8,
                height: '100%'
            }}
        >
            <Meta
                avatar={
                    <Avatar
                        size={64}
                        style={{
                            backgroundColor: '#1890ff',
                            marginTop: -50,
                            border: '3px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        {users.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                }
                title={users.username || '未知用户'}
                description={
                    <div style={{marginTop: 8}}>
                        <div style={{marginBottom: 4}}>
                            <Text type="secondary">
                                <strong>角色：</strong>
                                <span style={{color: '#722ed1'}}>{role.roleName || '未知角色'}</span>
                            </Text>
                        </div>
                        <div>
                            <Text type="secondary">
                                <strong>地区：</strong>
                                <span style={{color: '#1677ff'}}>{users.region ? users.region : "全球"}</span>
                            </Text>
                        </div>
                    </div>
                }
            />
        </Card>
    ), [users, role, viewList, likeList]);

    if (error) {
        return (
            <div style={{
                padding: '24px',
                background: 'linear-gradient(to right, #f5f7fa, #e9ecef)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Card style={{width: '100%', maxWidth: 600}}>
                    <Title level={3} style={{color: '#ff4d4f'}}>数据加载失败</Title>
                    <Text>{error}</Text>
                    <div style={{marginTop: 24}}>
                        <Button type="primary" onClick={() => window.location.reload()}>
                            重新加载
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div style={{
            padding: '0 16px',
            background: 'linear-gradient(to right, #f5f7fa, #e9ecef)',
            minHeight: '100vh'
        }}>
            <Title level={3} style={{padding: '16px 0', marginBottom: 0}}>新闻数据分析仪表盘</Title>
            <Text type="secondary" style={{display: 'block', marginBottom: 24}}>
                实时监控新闻数据表现和用户互动情况
            </Text>

            <Spin spinning={isLoading} tip="数据加载中..." size="large">
                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                    {/* 用户最常浏览卡片 */}
                    <Col xs={24} sm={12} md={8}>
                        <StatCard
                            title="用户最常浏览"
                            icon={<EyeOutlined style={{color: '#1890ff', marginRight: 8}}/>}
                            data={viewList}
                            type="view"
                        />
                    </Col>

                    {/* 点赞最多卡片 */}
                    <Col xs={24} sm={12} md={8}>
                        <StatCard
                            title="点赞最多"
                            icon={<LikeOutlined style={{color: '#ff4d4f', marginRight: 8}}/>}
                            data={likeList}
                            type="like"
                        />
                    </Col>

                    {/* 用户信息卡片 */}
                    <Col xs={24} sm={24} md={8}>
                        {userCard}
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                    <Col xs={24} lg={16}>
                        <ChartCard
                            title="新闻数据统计"
                            icon={<BarChartOutlined style={{marginRight: 8}}/>}
                        >
                            <div
                                ref={barChartRef}
                                style={{width: "100%", height: 420}}
                            />
                        </ChartCard>
                    </Col>

                    <Col xs={24} lg={8}>
                        <ChartCard
                            title="新闻类型分布"
                            icon={<BarChartOutlined style={{marginRight: 8}}/>}
                        >
                            <div
                                ref={pieChartRef}
                                style={{width: "100%", height: 350}}
                            />

                            <Divider style={{margin: '16px 0'}}/>

                            <div>
                                <Title level={5} style={{marginBottom: 12}}>类型占比分析</Title>
                                {newsRatio.map(item => (
                                    <div key={item.name} style={{marginBottom: 10}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Text>{item.name}</Text>
                                            <Text strong>{item.percent}%</Text>
                                        </div>
                                        <div style={{
                                            height: 8,
                                            background: '#f0f0f0',
                                            borderRadius: 4,
                                            marginTop: 4,
                                            overflow: 'hidden'
                                        }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${item.percent}%`,
                                                    background: 'linear-gradient(to right, #1890ff, #2f54eb)',
                                                    borderRadius: 4
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    </Col>
                </Row>
                {/*<Button onClick={()=>{console.log(newsList)}}>按钮</Button>*/}
                <Drawer
                    width="1000"
                    title="详细数据分析"
                    onClose={onClose}
                    open={open}
                >
                    <div ref={drawerPieRef} style={{
                        width: "100%",
                        height: "400px",
                        marginTop: "20px"
                    }}></div>
                </Drawer>
            </Spin>
        </div>
    );
}