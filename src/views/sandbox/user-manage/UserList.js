import React, {useEffect, useRef, useState, useCallback} from 'react';
import axios from "axios";
import {Button, Modal, Spin, Switch, Table, Card, Tag, message} from "antd";
import UserForm from "../../../components/user-manage/UserForm";
import {DeleteOutlined, EditOutlined, SyncOutlined, UserAddOutlined} from "@ant-design/icons";

export default function UserList() {
    const [dataSource, setDataSource] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [regionList, setRegionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('添加新用户');
    const [currentUser, setCurrentUser] = useState(null); // 当前正在编辑的用户

    // 从localStorage获取用户信息


    // 使用useCallback优化数据加载函数
    const loadData = useCallback(async () => {
        const {role: {id}, users} = JSON.parse(localStorage.getItem('token') || '{}');
        const userRegion = users?.region;
        setLoading(true);
        try {
            const [rolesRes, regionsRes, usersRes] = await Promise.all([
                axios.get('/roles'),
                axios.get('/regions'),
                axios.get('/users?_expand=role')
            ]);

            setRoleList(rolesRes.data)
            setRegionList(regionsRes.data)

            // 根据用户角色过滤数据
            if (id === "1") {
                // 超级管理员查看所有用户
                console.log(usersRes.data)
                setDataSource(usersRes.data)
            } else {
                // 区域管理员查看自己区域的编辑角色用户
                setDataSource([
                    ...usersRes.data.filter(user => user.region === userRegion && user.roleId === "3"),
                    users
                ]);
            }
        } catch (error) {
            message.error('数据加载失败');
            console.error('数据加载错误:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    // 使用useCallback优化删除确认函数
    const confirmDel = useCallback((item) => {
        Modal.confirm({
            title: '确认删除用户',
            content: `确定要删除用户 "${item.username}" 吗？此操作不可撤销。`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    setLoading(true);
                    await axios.delete(`/users/${item.id}`);
                    message.success(`用户 "${item.username}" 已删除`);
                    setDataSource(dataSource.filter(user => user.id !== item.id));
                } catch (error) {
                    message.error('删除用户失败');
                    console.error('删除错误:', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    }, [dataSource]);

    // 使用useCallback优化模态框打开函数
    const handleModalOpen = useCallback((user = null) => {
        setCurrentUser(user);
        if (user) {
            setModalTitle('编辑用户');
        } else {
            setModalTitle('添加新用户');
        }
        setModalVisible(true);
    }, []);

    // 使用useCallback优化状态变更函数
    const handleStatusChange = useCallback(async (checked, user) => {
        try {
            setLoading(true);
            await axios.patch(`/users/${user.id}`, {
                roleState: checked
            });
            message.success(`用户状态已${checked ? '启用' : '禁用'}`);
            // 更新本地状态
            setDataSource(dataSource.map(u =>
                u.id === user.id ? {...u, roleState: checked} : u
            ));
        } catch (error) {
            message.error('更新用户状态失败');
            console.error('更新错误:', error);
        } finally {
            setLoading(false);
        }
    }, [dataSource]);

    // 使用useCallback优化角色名称获取函数
    const getRoleName = useCallback((roleId) => {
        const role = roleList.find(r => r.id === roleId);
        return role ? role.roleName : '未知角色';
    }, [roleList]);

    // 使用useCallback优化角色标签获取函数
    const getRoleTag = useCallback((roleId) => {
        if (roleId === "1") return <Tag color="red">超级管理员</Tag>;
        if (roleId === "2") return <Tag color="blue">区域管理员</Tag>;
        return <Tag color="green">区域编辑</Tag>;
    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id
        },
        {
            title: '用户名',
            dataIndex: 'username',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: '区域',
            dataIndex: 'region',
            render: (region) => <Tag color="geekblue">{region || '全球'}</Tag>,
            filters: [...regionList.map(region => ({text: region.title, value: region.title})), {
                text: "全球",
                value: "全球"
            }],
            onFilter: (value, record) => {
                if (value === "全球") {
                    return record.region === ""
                }
                return record.region === value
            }
        },
        {
            title: '角色',
            dataIndex: 'roleId',
            render: (roleId) => (
                <div>
                    {getRoleTag(roleId)}
                    <span className="ml-2">{getRoleName(roleId)}</span>
                </div>
            )
        },
        {
            title: '状态',
            dataIndex: 'roleState',
            render: (state, record) => (
                <div className="flex items-center">
                    <Switch
                        checked={state}
                        disabled={record.default}
                        onChange={(checked) => handleStatusChange(checked, record)}
                    />
                    <span className="ml-2 text-sm">
                        {state ?
                            <span className="text-green-600">已启用</span> :
                            <span className="text-gray-500">已禁用</span>
                        }
                    </span>
                </div>
            )
        },
        {
            title: '操作',
            width: 120,
            render: (record) => (
                <div className="flex space-x-2">
                    <Button
                        danger
                        shape="circle"
                        icon={<DeleteOutlined/>}
                        onClick={() => confirmDel(record)}
                        disabled={record.default}
                        title={record.default ? "默认用户无法删除" : "删除用户"}
                    />
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<EditOutlined/>}
                        onClick={() => handleModalOpen(record)}
                        disabled={record.default}
                        title={record.default ? "默认用户不可操作" : "编辑用户"}
                    />
                </div>
            )
        }
    ];

    const formRef = useRef(null);
    // 使用useCallback优化重置模态框函数
    const resetModal = useCallback(() => {
        formRef.current.resetFields();
        setCurrentUser(null);
    }, []);
    // 使用useCallback优化表单提交函数
    const submitForm = useCallback(() => {
        formRef.current.validateFields().then(values => {
            setModalVisible(false);

            if (currentUser) {
                // 编辑现有用户
                axios.patch(`/users/${currentUser.id}`, {
                    ...values,
                    // 保留原有状态和其他字段
                    roleState: currentUser.roleState,
                    default: currentUser.default
                }).then(res => {
                    message.success('用户更新成功')
                    setDataSource(dataSource.map(item =>
                        item.id === currentUser.id ? {...item, ...values} : item
                    ))
                    resetModal();
                }).catch(err => {
                    message.error('更新用户失败').then(() => {
                        console.error(err);
                    })
                });
            } else {
                // 添加新用户
                axios.post(`/users`, {
                    ...values,
                    roleState: true,
                    default: false,
                }).then(res => {
                    message.success('用户添加成功').then(() => {
                        setDataSource([...dataSource, res.data]);
                    })
                    // 更新本地数据
                }).catch(err => {
                    message.error('添加用户失败').then(() => {
                        console.log(err)
                    })
                }).finally(() => {
                    resetModal();
                })
            }
        }).catch(errorInfo => {
            console.log('表单验证失败:', errorInfo);
        });
    }, [dataSource, currentUser, resetModal]);

    // 使用useCallback优化关闭模态框函数
    const handleModalClose = useCallback(() => {
        resetModal();
        setModalVisible(false);
    }, [resetModal]);

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Card
                title="用户管理"
                extra={
                    <div className="flex items-center space-x-3">
                        <Button
                            type="primary"
                            icon={<SyncOutlined/>}
                            loading={loading}
                            onClick={loadData}
                        >
                            刷新
                        </Button>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined/>}
                            onClick={() => handleModalOpen()}
                        >
                            添加用户
                        </Button>
                    </div>
                }
            >
                <Spin spinning={loading} tip="数据加载中...">
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="id"
                        TablePaginationConfig={true}
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            showTotal: total => `共 ${total} 位用户`
                        }}
                        scroll={{x: 800}}
                    />
                </Spin>
            </Card>

            <Modal
                open={modalVisible}
                title={modalTitle}
                okText={currentUser ? "更新" : "创建"}
                cancelText="取消"
                destroyOnHidden={true}
                clearOnDestroy
                onCancel={handleModalClose}
                onOk={submitForm}
            >
                <UserForm
                    ref={formRef}
                    regionList={regionList}
                    roleList={roleList}
                    currentUser={currentUser}
                />
            </Modal>
        </div>
    );
}