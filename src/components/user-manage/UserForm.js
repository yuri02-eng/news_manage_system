import React, {forwardRef, useEffect, useState, useImperativeHandle} from 'react'
import {Form, Input, Select} from "antd";

const {Option} = Select;

const UserForm = forwardRef(({regionList, roleList, currentUser}, ref) => {
    const [form] = Form.useForm();
    const [isDisabled, setIsDisabled] = useState(false);
    const [isRoleSelectDisabled, setIsRoleSelectDisabled] = useState(false); // 新增状态控制角色选择禁用

    // 安全解析当前登录用户信息
    let currentLoginUser = {};
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const parsedToken = JSON.parse(token);
            currentLoginUser = parsedToken?.users || {};
        }
    } catch (error) {
        console.error('Token parse error:', error);
    }

    // 暴露表单实例给父组件
    useImperativeHandle(ref, () => form);

    // 根据当前用户状态初始化表单
    useEffect(() => {
        if (currentUser) {
            // 编辑模式
            form.setFieldsValue({
                username: currentUser.username,
                password: currentUser.password,
                region: currentUser.region,
                roleId: String(currentUser.roleId)
            });

            // 根据角色类型初始化禁用状态
            setIsDisabled(currentUser.roleId === "1");

            // 新增：控制区域管理员不能修改其他用户的角色
            // 如果当前登录用户是区域管理员(roleId=2)，且编辑的用户不是编辑者(roleId=3)
            // 则禁用角色选择框，因为区域管理员只能管理编辑者
            if (currentLoginUser?.roleId === "2" && currentUser.roleId !== "3") {
                setIsRoleSelectDisabled(true);
            }
        } else {
            // 添加模式
            form.resetFields();
            setIsDisabled(false);
            setIsRoleSelectDisabled(false);

            // 如果是区域管理员，默认设置角色为编辑者(roleId=3)
            if (currentLoginUser?.roleId === "2") {
                form.setFieldsValue({
                    roleId: "3"
                });
            }
        }
    }, [currentUser, form]);

    // 监听角色变化
    const handleRoleChange = (value) => {
        const roleId = String(value);

        if (roleId === "1") {
            setIsDisabled(true);
            // 如果是超级管理员，清空区域选择
            form.setFieldsValue({ region: undefined });
        } else {
            setIsDisabled(false);
        }
    };

    // 权限过滤：决定哪些角色选项应该显示
    const getFilteredRoleOptions = () => {
        // 角色权限规则:
        // 1. 超级管理员(roleId=1): 可以看到所有角色选项
        // 2. 区域管理员(roleId=2):
        //    - 在添加模式: 只能选择编辑者(roleId=3)
        //    - 在编辑模式: 只能编辑现有的编辑者，不能修改角色
        // 3. 编辑(roleId=3): 没有管理用户的权限，这里不会出现

        const loginRoleId = currentLoginUser?.roleId;

        if (loginRoleId === "1") {
            // 超级管理员可以看到所有角色
            return roleList;
        } else if (loginRoleId === "2") {
            // 区域管理员
            if (currentUser) {
                // 编辑模式：如果编辑的是一个编辑者(roleId=3)，显示编辑者选项
                // 否则返回空数组(不应该编辑非编辑者用户)
                return currentUser.roleId === "3"
                    ? roleList.filter(item => item.id === "3")
                    : [];
            } else {
                // 添加模式：只能添加编辑者
                return roleList.filter(item => item.id === "3");
            }
        } else {
            // 其他情况（编辑者或未定义）: 没有权限
            return [];
        }
    };

    // 权限过滤：决定哪些区域选项应该显示
    const getFilteredRegionOptions = () => {
        return regionList
            .filter(item => {
                if (currentLoginUser?.roleId === "1") {
                    // 超级管理员可以看到所有区域
                    return true;
                } else if (currentLoginUser?.roleId === "2") {
                    // 区域管理员只能看到自己管理的区域
                    return item.value === currentLoginUser.region;
                }
                // 编辑者没有管理权限
                return false;
            })
            .map(item => ({
                value: item.value,
                label: item.title
            }));
    };

    // 获取过滤后的选项
    const filteredRegionOptions = getFilteredRegionOptions();
    const filteredRoleOptions = getFilteredRoleOptions();

    return (
        <Form
            form={form}
            layout="vertical"
            preserve={false}
        >
            <Form.Item
                name="username"
                label="用户名"
                rules={[{required: true, message: '请输入用户名!'}]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="password"
                label="密码"
                rules={[
                    {required: !currentUser, message: '请输入密码!'},
                    {min: 6, message: '密码至少6个字符'}
                ]}
                extra={currentUser && "留空表示不修改密码"}
            >
                <Input.Password placeholder={currentUser ? "留空不修改密码" : "请输入密码"} />
            </Form.Item>

            <Form.Item
                name="region"
                label="区域"
                rules={isDisabled ? [] : [{required: true, message: '请选择区域!'}]}
            >
                <Select
                    options={filteredRegionOptions}
                    disabled={isDisabled || isRoleSelectDisabled || filteredRegionOptions.length === 0}
                    placeholder={
                        isRoleSelectDisabled ? "此角色不需要区域" :
                        filteredRegionOptions.length === 0 ? "无可用区域" : "请选择区域"
                    }
                />
            </Form.Item>

            <Form.Item
                name="roleId"
                label="角色"
                rules={[{required: true, message: '请选择角色!'}]}
            >
                <Select
                    onChange={handleRoleChange}
                    disabled={isRoleSelectDisabled || filteredRoleOptions.length <= 1}
                >
                    {filteredRoleOptions.map(item => (
                        <Option value={String(item.id)} key={item.id}>
                            {item.roleName}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
        </Form>
    );
});

export default UserForm;