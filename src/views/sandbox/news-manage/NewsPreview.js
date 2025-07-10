import React, {useEffect, useState} from 'react';
import {Descriptions, Divider, Button} from 'antd';
import {useParams, useNavigate} from "react-router"; // 添加 useNavigate
import axios from "axios";
import moment from 'moment';
import {LeftOutlined} from '@ant-design/icons'; // 引入返回图标

export default function NewsPreview() {
    const params = useParams();
    const navigate = useNavigate(); // 使用 useNavigate 钩子
    const [newsInfo, setnewsInfo] = useState(null);
    const auditList=["未审核","审核中","已通过","未通过"]
    const publishList=["未发布","待发布","已发布","已下线"]
    const colorList=["gray","orange","green","red"]
    // 添加返回函数
    const handleGoBack = () => {
        navigate(-1); // 使用 navigate(-1) 返回上一页
    };

    useEffect(() => {
        axios.get(`news/${params.id}`).then((res) => {
            setnewsInfo(res.data);
            console.log(res.data);
        });
    }, [params.id]); // 添加依赖项 params.id

    const items = newsInfo ? [
        {
            key: '1',
            label: '创建者',
            children: newsInfo.author,
        },
        {
            key: '2',
            label: '创建时间',
            children: moment(newsInfo.createTime).format('YYYY/MM/DD HH:mm:ss'),
        },
        {
            key: '3',
            label: '发布时间',
            children: newsInfo.publishTime ? moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss') : "-",
        },
        {
            key: '4',
            label: '区域',
            children: newsInfo.region,
        },
        {
            key: '5',
            label: '审核状态',
            children: <span style={{color: colorList[newsInfo.auditState]}}>{auditList[newsInfo.auditState]}</span>,
        },
        {
            key: '6',
            label: '发布状态',
            children: <span style={{color: colorList[newsInfo.publishState]}}>{publishList[newsInfo.publishState]}</span>,
        },
        {
            key: '7',
            label: '访问数量',
            children: newsInfo.view,
        },
        {
            key: '8',
            label: '点赞数量',
            children: newsInfo.view,
        },
        {
            key: '9',
            label: '评论数量',
            children: 0,
        },
    ] : []

    return (
        <>
            {newsInfo &&
                <div style={{width: "67%", margin: "auto"}}>
                    {/* 添加返回按钮 */}
                    <Button
                        type="primary"
                        icon={<LeftOutlined/>}
                        onClick={handleGoBack}
                        style={{marginTop: 16}}
                    >
                        返回
                    </Button>

                    <div style={{textAlign: "center", fontSize: "50px", lineHeight: "50px"}}>
                        <span>{newsInfo.title}</span>
                        <span style={{color: "rgba(0,0,0,0.3)", fontSize: "25px", lineHeight: "25px"}}>
                            {newsInfo.categoryId}
                        </span>
                    </div>

                    <Divider style={{borderColor: '#7cb305'}}></Divider>

                    <Descriptions
                        classNames={{extra: 'my-classname'}}
                        styles={{extra: {color: 'red'}}}
                        items={items}
                    />

                    <div
                        dangerouslySetInnerHTML={{__html: newsInfo?.content}}
                        style={{border: "1px solid gray", minHeight: "30vh"}}
                    ></div>
                </div>
            }
        </>
    );
}