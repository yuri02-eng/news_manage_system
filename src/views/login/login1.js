import React, { useState } from 'react';
import { Button, Checkbox, Flex, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from './login.module.css';
export default function Login1() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    console.log('Login values:', values);
    setLoading(true);

    // 模拟登录API请求
    setTimeout(() => {
      message.success('登录成功！');
      setLoading(false);
      // 实际项目中这里会设置token并重定向到主页
      localStorage.setItem("token", "demo-token-value");
      window.location.href = "/"; // 重定向到主页
    }, 1500);
  }

  // 解决浏览器弃用警告的样式方案
  const highContrastStyle = `
    @media screen and (forced-colors: active) {
      :root {
        --button-bg: Highlight;
        --button-text: HighlightText;
      }
    }
  `;

    return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>系统登录</h2>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined className={styles.inputIcon} />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className={styles.inputIcon} />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item className={styles.loginOptions}>
            <Flex justify="space-between" align="center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={styles.remember}>记住我</Checkbox>
              </Form.Item>
              <a className={styles.loginForgot} href="#">忘记密码</a>
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
          </Form.Item>

          <div className={styles.loginRegister}>
            <span>还没有账号? </span>
            <a className={styles.registerLink} href="#">立即注册</a>
          </div>
        </Form>
      </div>
    </div>
  );
}