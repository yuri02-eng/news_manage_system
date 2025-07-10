import React from 'react'
import NewsPublish from "../../../components/publish-manage/NewsPublish";
import usePublish from "../../../components/publish-manage/usePublish";
import {Button, notification} from "antd";
import axios from "axios";

export default function Sunset() {
    const {dataSource, setDataSource} = usePublish(3)
    const handleDelete = (id) => {
        axios.delete(`/news/${id}`).then(res => {
            setDataSource(dataSource.filter(item => item.id !== id))
            notification.error({
                message: `通知`,
                description: `您已经删除您的新闻${id}`,
                placement: "bottomRight"
            })
        })
    }
    return (
        <div><NewsPublish dataSource={dataSource}
                          button={(id) => <Button danger onClick={() => handleDelete(id)}>删除</Button>}></NewsPublish>
        </div>
    )
}
