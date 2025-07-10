import React, {useCallback, useEffect, useState} from 'react'
import {Button, Table, Tag, Modal, Spin, Switch} from "antd";
import axios from "axios";
import {DeleteOutlined} from "@ant-design/icons";

const config = {
    title: '确认删除',
    content: (
        <>
            <div>您确定要删除吗，此操作不可撤销？</div>
        </>
    ),
};
export default function RightList() {
    const [dataSource, setdataSource] = useState([])
    const [spinning, setSpinning] = React.useState(false);

    const treeProcess = useCallback((data) => {
        return data.map(item => {
            if (item.children) {
                if (item.children.length === 0) {
                    return {...item, children: null}
                } else {
                    return {...item, children: treeProcess(item.children)}
                }
            }
            return {...item}
        })
    }, [])

    useEffect(() => {
        axios.get("/rights?_embed=children").then(res => {
            setdataSource(treeProcess(res.data))
            // console.log(res.data)
        })
    }, [treeProcess]);
    const [modal, contextHolder] = Modal.useModal();
    Spin.setDefaultIndicator(modal)

    const confirmDel = async (item) => {
        const confirmed = await modal.confirm(config);
        // console.log(confirmed, item)
        if (confirmed) {
            if (item.grade === 1) {
                // console.log(item)
                setSpinning(true)
                axios.delete(`/rights/${item.id}`).then(res => {
                    setSpinning(false)
                    setdataSource(dataSource.filter(data => data.id !== item.id))
                })
            } else {
                let list = dataSource.filter(data => data.id === item.rightId)
                list[0].children = list[0].children.filter(data => data.id !== item.id)
                setdataSource([...dataSource])
            }
        }
    }
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'name',
        },
        {
            title: '权限名称',
            dataIndex: 'title',
            key: 'age',
        },
        {
            title: '权限路径',
            dataIndex: 'key',
            key: 'address',
            render: (key) => {
                return <Tag color="orange">{key}</Tag>
            }
        },
        {
            title: '删除',
            dataIndex: '',
            key: 'x',
            render: (item) => <div>
                <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={() => confirmDel(item)}/>
            </div>
        },
        {
            title: '启用',
            dataIndex: '',
            key: 'y',
            render: (item) => {
                // console.log(item)
                if (item.pagepermisson !== undefined) {
                    return (
                        <div>
                            <Switch checked={item.pagepermisson} onChange={() => onSwitchChange(item)}/>
                        </div>
                    )
                }
            },
        },
    ]
    const onSwitchChange = (item) => {
        item.pagepermisson = item.pagepermisson?0:1
        // console.log(item.pagepermisson)
        setdataSource([...dataSource])
        if (item.grade === 1) {
            axios.patch(`/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            axios.patch(`/children/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        }
    }
    return (
        <>
            {contextHolder}
            <Table dataSource={dataSource} columns={columns} pagination={{defaultPageSize: 5}}/>
            <Spin spinning={spinning} fullscreen/>
        </>
    )
}
