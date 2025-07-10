import React from 'react'
import NewsPublish from "../../../components/publish-manage/NewsPublish";
import usePublish from "../../../components/publish-manage/usePublish";
import {Button, notification} from "antd";
import axios from "axios";

export default function Published() {
    const {dataSource, setDataSource} = usePublish(2)
    const handleSunset = (id) => {
        axios.patch(`/news/${id}`, {"publishState": 3, "publishTime": Date.now()}).then(res => {
            setDataSource(dataSource.filter(item => item.id !== id))
            notification.info({
                message: `通知`,
                description: `您可以到[发布管理/已下线]中查看您的新闻`,
                placement: "bottomRight"
            })
        })
    }
    return (
        <div><NewsPublish dataSource={dataSource} button={(id) => <Button danger onClick={() => {
            handleSunset(id)
        }}>下线</Button>}></NewsPublish></div>
    )
}
