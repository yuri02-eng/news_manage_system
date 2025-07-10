import React, {useEffect, useState} from 'react'
import {Button, Form, Input, message, notification, Select, Steps} from "antd";
import style from "./NewsAdd.module.css"
import axios from "axios";
import NewsEditor from "../../../components/news-manage/NewsEditor";
import {useNavigate, useParams} from "react-router";
import {LeftOutlined} from '@ant-design/icons';

export default function NewsUpdate() {
    const [current, setCurrent] = useState(0)
    const [catagoryList, setCatagoryList] = useState([])
    const [formInfo, setformInfo] = useState({})
    const [htmlContent, sethtmlContent] = useState("")
    const params = useParams();
    const navigate = useNavigate()
    const [form] = Form.useForm();
    useEffect(() => {
        axios.get('/categories').then(res => {
            console.log(res.data)
            setCatagoryList(res.data)
        })
    }, []);
    useEffect(() => {
        axios.get(`news/${params.id}`).then((res) => {
            let {title, categoryId, content} = res.data
            form.setFieldsValue({
                title,
                categoryId,
            })
            sethtmlContent(content)
        });
    }, [params.id,form]); // 添加依赖项 params.id

    const handleNext = () => {
        if (current === 0) {
            form.validateFields().then(res => {
                setformInfo(res)
                setCurrent(current + 1)
            }).catch(err => {
                console.log(err)
            })
        } else {
            console.log(formInfo)
            if (current === 1 && htmlContent === "") {
                message.error("新闻内容不能为空")
            } else {
                setCurrent(current + 1)
            }
        }
    }
    const handPrevious = () => {
        setCurrent(current - 1)
    }
    const handleGoBack = () => {
        navigate(-1); // 使用navigate(-1)返回上一页[1,2](@ref)
    };
    const handleSave = (auditState) => {
        axios.patch(`/news/${params.id}`, {
            ...formInfo,
            "content": htmlContent,
            "auditState": auditState,
        }).then(res => {
            message.success(auditState === 0 ? "保存草稿成功" : "提交审核成功")
            notification.open({
                message: `通知`,
                description:
                    `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
                placement: 'bottomRight'
            });
            navigate(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')
        })
    }

    return (
        <div>
            <div style={{display: 'flex', alignItems: 'center', marginLeft: "20px"}}>
                <Button
                    type="default"
                    icon={<LeftOutlined/>}
                    onClick={handleGoBack}
                    style={{marginRight: 16}}
                >
                    返回
                </Button>
                <h2>更新新闻</h2>
            </div>
            <Steps
                current={current}
                items={[
                    {
                        title: '基本信息',
                        description: "新闻标题、新闻分类",
                    },
                    {
                        title: '新闻主体',
                        description: "新闻主体内容",
                        subTitle: 'Left 00:00:08',
                    },
                    {
                        title: '新闻提交',
                        description: "保存草稿或者提交审核",
                    },
                ]}
            />
            <div className={style.content}>
                <div className={current === 0 ? "" : style.active}>
                    <Form
                        name="basic"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        style={{maxWidth: 600}}
                        initialValues={{remember: true}}
                        autoComplete="off"
                        form={form}
                    >
                        <Form.Item
                            label="新闻标题"
                            name="title"
                            rules={[{required: true, message: 'Please input your 新闻标题!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="新闻分类"
                            name="categoryId"
                            rules={[{required: true, message: 'Please input your password!'}]}
                        >
                            <Select options={catagoryList.map(item => ({
                                value: item.id,
                                label: item.title,
                                key: item.id
                            }))}></Select>
                        </Form.Item>

                    </Form>
                </div>
                <div className={current === 1 ? "" : style.active}>
                    <NewsEditor getContent={(value) => {
                        sethtmlContent(value)
                    }} content={htmlContent}></NewsEditor>
                </div>
                <div className={current === 2 ? "" : style.active}></div>
            </div>
            <div style={{marginTop: "20px"}}>
                {current === 2 &&
                    <span><Button type={"primary"} onClick={() => handleSave(0)}>保存草稿箱</Button><Button
                        danger onClick={() => handleSave(1)}>提交审核</Button></span>}
                {current < 2 && <Button type={"primary"} onClick={handleNext}>下一步</Button>}
                {current > 0 && <Button onClick={handPrevious}>上一步</Button>}
            </div>
        </div>
    )
}
