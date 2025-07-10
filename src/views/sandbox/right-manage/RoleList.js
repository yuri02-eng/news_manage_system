import React, {useEffect, useState} from 'react'
import {Button, Modal, Spin, Table, Tree} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import axios from "axios";

const config = {
    title: '确认删除',
    content: (
        <>
            <div>您确定要删除吗，此操作不可撤销？</div>
        </>
    ),
};
export default function RoleList() {
    const [dataSource, setdataSource] = useState([])
    const [rightList, setrightList] = useState([])
    const [currentrights, setcurrentrights] = useState([])
    const [currentrid, setcurrentrid] = useState(0)
    const [spinning, setSpinning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOk = () => {
        axios.patch(`/roles/${currentrid}`, {rights: currentrights}).then(res => {
                setIsModalOpen(false)
                setdataSource(dataSource.map(item => {
                        if (item.id === currentrid) {
                            return {
                                ...item,
                                rights: currentrights
                            }
                        }
                        return item
                    })
                )
            }
        )
    }

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        axios.get('/roles').then(res => {
                console.log(res.data)
                setdataSource(res.data)
            }
        )
    }, [])
    useEffect(() => {
        axios.get('/rights?_embed=children').then(res => {
                console.log("right", res.data)
                setrightList(res.data)
            }
        )
    }, [])
    const [modal, contextHolder] = Modal.useModal();
    const confirmDel = async (item) => {
        const confirmed = await modal.confirm(config);
        // console.log(confirmed, item)
        if (confirmed) {
            // console.log(item)
            setSpinning(true)
            axios.delete(`/roles/${item.id}`).then(res => {
                setSpinning(false)
                setdataSource(dataSource.filter(data => data.id !== item.id))
            })
        }
    }
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '角色名称',
            dataIndex: 'roleName',
        },
        {
            title: '操作',
            dataIndex: '',
            render: (item) => <div>
                <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={() => confirmDel(item)}/>
                <Button type="primary" shape="circle" icon={<EditOutlined/>} onClick={() => {
                    setIsModalOpen(true)
                    setcurrentrights(item.rights)
                    setcurrentrid(item.id)
                }}/>
            </div>
        },]
    const onCheck = (checkedKeys, info) => {
        setcurrentrights(checkedKeys)
    }
    return (
        <div>
            {contextHolder}
            <Table dataSource={dataSource} columns={columns} pagination={{defaultPageSize: 5}}
                   rowKey={item => item.id}/>
            <Spin spinning={spinning} fullscreen/>
            <Modal
                title="权限分配"
                closable={{'aria-label': 'Custom Close Button'}}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Tree checkable treeData={rightList} checkedKeys={currentrights} onCheck={onCheck}
                      checkStrictly={true}/>
            </Modal>
        </div>
    )
}
