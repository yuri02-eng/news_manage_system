import React, {useEffect, useState} from 'react';
import {Content, Header} from "antd/es/layout/layout";
import {Card, Col, Layout, List, Row, Typography, Tag, Divider} from "antd";
import axios from "axios";
import _ from "lodash";
import {FireOutlined, StarOutlined} from '@ant-design/icons';

const {Title, Paragraph} = Typography;

export default function News() {
    const [list, setList] = useState([]);

    useEffect(() => {
        axios.get(`/news?publishState=2&_expand=category`).then(res => {
            setList(Object.entries(_.groupBy(res.data, item => item.category.title)));
        });
    }, []);

    const headerStyle = {
        textAlign: 'center',
        color: '#1d1d1d',
        height: 'auto',
        padding: '24px 48px',
        backgroundColor: "white",
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
    };

    const contentStyle = {
        padding: '24px 0',
        backgroundColor: '#f0f2f5',
        minHeight: 'calc(100vh - 112px)'
    };

    return (
        <Layout style={{backgroundColor: '#f0f2f5'}}>
            <Header style={headerStyle}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px'}}>
                    <FireOutlined style={{fontSize: '48px', color: '#ff4d4f'}}/>
                    <div>
                        <Title level={1} style={{margin: 0}}>全球大新闻</Title>
                        <Paragraph type="secondary" style={{fontSize: '18px', margin: 0}}>
                            洞悉全球动态，掌握前沿资讯
                        </Paragraph>
                    </div>
                </div>
            </Header>

            <Content style={contentStyle}>
                <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
                    <Title level={3} style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <StarOutlined style={{color: '#faad14'}}/>
                        <span>新闻分类浏览</span>
                    </Title>

                    <Divider orientation="left" plain>
                        <Tag color="magenta" style={{fontSize: '16px', padding: '8px'}}>资讯热榜</Tag>
                    </Divider>

                    <Row gutter={[24, 24]}>
                        {list.map(([category, items]) => (
                            <Col xs={24} sm={12} md={8} lg={8} key={category}>
                                <Card
                                    title={category}
                                    bordered={false}
                                    headStyle={{
                                        backgroundColor: '#f0f9ff',
                                        borderBottom: '1px solid #e8e8e8',
                                        fontSize: '18px',
                                        fontWeight: 600
                                    }}
                                    bodyStyle={{padding: 0}}
                                    hoverable
                                    style={{borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                                >
                                    <List
                                        size="large"
                                        dataSource={items}
                                        pagination={{
                                            pageSize: 4,
                                            simple: true,
                                            style: {margin: '16px'}
                                        }}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{
                                                    padding: '16px 24px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'all 0.3s'
                                                }}
                                                className="news-list-item"
                                            >
                                                <a
                                                    href={`/detail/${item.id}`}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        color: '#1d1d1d',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                                        <Tag color="blue" style={{marginRight: '12px'}}>
                                                            {item.region}
                                                        </Tag>
                                                        <span style={{flex: 1}}>
                              {item.title}
                            </span>
                                                        <span style={{color: '#8c8c8c', fontSize: '12px'}}>
                              {new Date(item.publishTime).toLocaleDateString()}
                            </span>
                                                    </div>
                                                </a>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>
        </Layout>
    );
}