import React, {useCallback, useEffect, useState} from 'react'
import {Table} from "antd";
import axios from "axios";
export default function NewsPublish(props) {
    const [categoryList, setcategoryList] = useState([])

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
        axios.get("/categories").then(res => {
            setcategoryList(treeProcess(res.data))
            // console.log(res.data)
        })
    }, [treeProcess]);
    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',
            key: 'title',
            render: (title, item) => {
                return <a href={`/news-manage/preview/${item.id}`}>{title}</a>
            }
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: '新闻分类',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (categoryId) => {
                return <div>{categoryList.find(item => item.id === categoryId)?.title}</div>
            }
        },
        {
            title: '删除',
            dataIndex: '',
            key: 'x',
            render: (item) => <div>
                {props.button(item.id)}
            </div>
        }
    ]

    return (
        <>
            <Table dataSource={props.dataSource} columns={columns} pagination={{defaultPageSize: 5}}
                   rowKey={item => item.id}/>
        </>
    )
}
