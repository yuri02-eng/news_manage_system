import React, {useEffect, useState} from 'react'
import {Button, message, Modal, notification,Table, Tag} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import axios from "axios";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import {useNavigate} from "react-router";

const config = {
    title: '确认删除',
    content: (
        <>
            <div>您确定要删除吗，此操作不可撤销？</div>
        </>
    ),
};
export default function NewsDraft() {
    const [dataSource, setdataSource] = useState([])
    const [categoryList, setcategoryList] = useState([])
    const [modal, contextHolder] = Modal.useModal();
    useEffect(() => {
        axios.get("/news?author=admin&auditState=0&_expand=category").then(res => {
            console.log(res.data)
            setdataSource(res.data.map(item => ({...item, key: item.id})))
            // console.log(res.data)
        })
        axios.get("/categories").then(res => {
            setcategoryList(res.data)
        })
    }, [])
    const confirmDel = async (item) => {
        const confirmed = await modal.confirm(config);
        // console.log(confirmed, item)
        if (confirmed) {
            // console.log(item)
            axios.delete(`/news/${item.id}`).then(res => {
                setdataSource(dataSource.filter(data => data.id !== item.id))
            })
        }

    }
    const navigate = useNavigate()
    const handleEdit = async (item) => {
        navigate(`/news-manage/update/${item.id}`)
    }
    const submitPub = async (item) => {
        axios.patch(`/news/${item.id}`,
            {auditState: 1}).then(res => {
            message.success( "提交审核成功")
            notification.open({
                message: `通知`,
                description:
                    `您可以到审核列表中查看您的新闻`,
                placement: 'bottomRight'
            });
            navigate('/audit-manage/list')
        })
    }
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
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
            render: (key) => {
                return <Tag color="orange">{key}</Tag>
            }
        },
        {
            title: '新闻分类',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (key) => {
                return <Tag color="orange">{categoryList.find(item => item.id === key)?.title}</Tag>
            }
        },
        {
            title: '操作',
            dataIndex: '',
            key: 'x',
            render: (item) => <div>
                <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={() => confirmDel(item)}/>
                <Button shape="circle" icon={<EditOutlined/>} onClick={() => handleEdit(item)}/>
                <Button type="primary" icon={<UploadOutlined/>} onClick={() => submitPub(item)}/>
            </div>
        },
    ]
    return (
        <div>
            {contextHolder}
            <Table dataSource={dataSource} columns={columns} pagination={{defaultPageSize: 5}}/>
        </div>
    )
}
