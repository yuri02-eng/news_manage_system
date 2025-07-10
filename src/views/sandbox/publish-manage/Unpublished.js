import React from 'react'
import NewsPublish from "../../../components/publish-manage/NewsPublish";
import usePublish from "../../../components/publish-manage/usePublish";
import {Button, notification} from "antd";
import axios from "axios";

export default function Unpublished() {
    const {dataSource, setDataSource} = usePublish(1)
    const handlePublish = (id) => {
        axios.patch(`/news/${id}`, {"publishState": 2, "publishTime": Date.now()}).then(res => {
            setDataSource(dataSource.filter(item => item.id !== id))
            notification.info({
                message: "发布成功",
                description: "恭喜你，发布成功,到[发布管理/已发布]中进行查看",
                placement: "bottomRight"
            })
        })
    }
    return (
        <div><NewsPublish dataSource={dataSource} button={(id) => <Button type={"primary"} onClick={() => {
            handlePublish(id)
        }}>发布</Button>}></NewsPublish></div>
    )
}
