import React, {useEffect, useState} from 'react'
import axios from "axios";
import {Button, notification, Table, Tag} from "antd";
import {useNavigate} from "react-router";

export default function AuditList() {
    const [dataSource, setdataSource] = useState([])
    const [categoryList, setcategoryList] = useState([])
    const {users: {username}} = JSON.parse(localStorage.getItem("token"))
    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`/news?author=${username}&auditState_ne=0&publishState_lte=1`).then(res => {
            setdataSource(res.data.map(item => ({...item, key: item.id})))
        })
    }, [username])
    useEffect(() => {
        axios.get(`/categories`).then(res => {
            setcategoryList(res.data)
        })
    }, []);
    const handleUpdate = (id) => {
        navigate(`/news-manage/update/${id}`)
    }
    const handleRevert = (id) => {
        axios.patch(`/news/${id}`, {auditState: 0}).then(res => {
            if (res.data) {
                setdataSource(dataSource.filter(item => item.id !== id))
            }
            notification.info({
                message: `通知`,
                description:
                    `您可以到草稿箱中查看您的新闻`,
                placement: 'bottomRight'
            });
        })
    }
    const handlePublish = (id, publishState) => {
        axios.patch(`/news/${id}`, {publishState,publishTime:Date.now()}).then(res => {
            if (res.data) {
                setdataSource(dataSource.filter(item => item.id !== id))
            }
            navigate('/publish-manage/published')
            notification.info({
                message: `通知`,
                description:
                    `您可以到[发布管理/已发布]中查看您的新闻`,
                placement: 'bottomRight'
            });
        })
    }
    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',
            key: 'title',
            render: (title, item) => {
                return <a href={`/news-manage/preview/${item.id}`}>{title}</a>
            }
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
            render: (categoryId) => {
                return <div>{categoryList.find(item => item.id === categoryId)?.title}</div>
            }
        },
        {
            title: '审核状态',
            dataIndex: 'auditState',
            key: 'auditState',
            render: (key) => {
                const colorList = ["", "orange", "green", "red"]
                const auditList = ["未审核", "审核中", "已通过", "未通过"]
                return <Tag color={colorList[key]}>{auditList[key]}</Tag>
            }
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'x',
            render: (item) => <div>
                {item.auditState === 1 && <Button type="primary" onClick={() => handleRevert(item.id)}>撤销</Button>}
                {item.auditState === 2 && <Button danger onClick={() => handlePublish(item.id, 2)}>发布</Button>}
                {item.auditState === 3 && <Button onClick={() => handleUpdate(item.id)}>更改</Button>}
            </div>
        },
    ]
    return (
        <div><Table dataSource={dataSource} columns={columns} TablePaginationConfig={true} defaultPageSize={5}/></div>
    )
}
