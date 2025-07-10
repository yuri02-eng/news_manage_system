import React from 'react';
import {Button, Checkbox, Flex, Form, Input, message} from "antd";
import UserOutlined from "@ant-design/icons/UserOutlined";
import {LockOutlined} from "@ant-design/icons";
import styles from './form.module.css';
import ParticleBackground from "./ParticleBackground";
import axios from "axios";

export default function Login() {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            // 模拟API请求
            await new Promise(resolve => setTimeout(resolve, 1500));
            axios.get(`http://localhost:8000/users?username=${values.username}&password=${values.password}&roleState=true`).then(res => {
                if (res.data.length === 0) {
                    message.error('用户名或密码错误，请重试');
                } else {
                    const token={users:res.data[0]}
                    axios.get(`http://localhost:8000/roles?id=${token.users.roleId}`).then(res => {
                        token.role=res.data[0]
                        localStorage.setItem("token", JSON.stringify(token))
                    })
                    window.location.href = '/home'
                    message.success('登录成功！');
                }
            })

        } catch (error) {
            message.error('登录失败，请重试');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.pageContainer}>
            <ParticleBackground
                particleCount={120}
                particleSize={2}
                connectionDistance={150}
                particleColor="rgba(80, 180, 255, 0.7)"
                connectionColor="rgba(80, 180, 255, 0.3)"
                velocity={1.5}
            />

            <div className={styles.formCard}>
                <div className={styles.logoContainer}>
                    <div className={styles.globeIcon}></div>
                    <h1 className={styles.systemTitle}>全球新闻管理系统</h1>
                </div>

                <Form
                    form={form}
                    name="login"
                    initialValues={{remember: true}}
                    className={styles.loginForm}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{required: true, message: '请输入用户名!'}]}
                    >
                        <Input
                            prefix={<UserOutlined className={styles.inputPrefix}/>}
                            placeholder="用户名"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{required: true, message: '请输入密码!'}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className={styles.inputPrefix}/>}
                            placeholder="密码"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Flex justify="space-between" align="center">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox className={styles.rememberCheckbox}>记住我</Checkbox>
                            </Form.Item>
                            <a href="#" className={styles.forgotLink}>忘记密码?</a>
                        </Flex>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            block
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            className={styles.loginButton}
                        >
                            登录
                        </Button>
                        <div className={styles.registerHint}>
                            还没有账号? <a href="#" className={styles.registerLink}>立即注册</a>
                        </div>
                    </Form.Item>
                </Form>
            </div>

            <div className={styles.pageFooter}>
                © 2023 全球新闻管理系统 版权所有
            </div>
        </div>
    )
}