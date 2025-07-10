import React, {useEffect, useState} from 'react'
import axios from "axios";
import {Button, Modal, Spin, Table} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import {useContext, useRef} from 'react';
import {Form, Input} from 'antd';

const config = {
    title: '确认删除',
    content: (
        <>
            <div>您确定要删除吗，此操作不可撤销？</div>
        </>
    ),
};
const __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                });
        }

        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }

            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }

            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
const __rest =
    (this && this.__rest) ||
    function (s, e) {
        let p = Object.getOwnPropertySymbols(s);
        let i = 0;
        const t = {};
        for (p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (; i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
export default function NewsCategory() {
    // 1. 获取当前用户的所有权限
    // 2. 判断当前用户是否有category的权限
    // 3. 如果有，则渲染组件，如果没有，则渲染403
    const [dataSource, setDataSource] = useState([])
    const [spinning, setSpinning] = React.useState(false);
    useEffect(() => {
        axios.get(`/categories`).then(res => {
            setDataSource(res.data)
        })
    }, []);

    const defaultColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'name',
        },
        {
            title: '栏目名称',
            dataIndex: 'title',
            key: 'title',
            editable: true,
        },
        {
            title: '删除',
            dataIndex: '',
            key: 'x',
            render: (item) => <div>
                <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={() => confirmDel(item)}/>
            </div>
        },
    ]
    const [modal, contextHolder] = Modal.useModal();
    const confirmDel = async (item) => {
        const confirmed = await modal.confirm(config);
        // console.log(confirmed, item)
        if (confirmed) {
            setSpinning(true)
            axios.delete(`/categories/${item.id}`).then(res => {
                if (res.data.success) {
                    setDataSource(dataSource.filter(data => data.id !== item.id))
                }
                setSpinning(false)
            })
        }
    }

    const EditableContext = React.createContext(null);
    const EditableRow = _a => {
        var {index} = _a,
            props = __rest(_a, ['index']);
        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
                <EditableContext.Provider value={form}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    const EditableCell = _a => {
        var {title, editable, children, dataIndex, record, handleSave} = _a,
            restProps = __rest(_a, ['title', 'editable', 'children', 'dataIndex', 'record', 'handleSave']);
        const [editing, setEditing] = useState(false);
        const inputRef = useRef(null);
        const form = useContext(EditableContext);
        useEffect(() => {
            var _a;
            if (editing) {
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }, [editing]);
        const toggleEdit = () => {
            setEditing(!editing);
            form.setFieldsValue({[dataIndex]: record[dataIndex]});
        };
        const save = () =>
            __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const values = yield form.validateFields();
                    toggleEdit();
                    handleSave(Object.assign(Object.assign({}, record), values));
                } catch (errInfo) {
                    console.log('Save failed:', errInfo);
                }
            });
        let childNode = children;
        if (editable) {
            childNode = editing ? (
                <Form.Item
                    style={{margin: 0}}
                    name={dataIndex}
                    rules={[{required: true, message: `${title} is required.`}]}
                >
                    <Input ref={inputRef} onPressEnter={save} onBlur={save}/>
                </Form.Item>
            ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{paddingInlineEnd: 24}}
                    onClick={toggleEdit}
                >
                    {children}
                </div>
            );
        }
        return <td {...restProps}>{childNode}</td>;
    };
    const columns = defaultColumns.map(col => {
        if (!col.editable) {
            return col;
        }
        return Object.assign(Object.assign({}, col), {
            onCell: record => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        });
    });
    const handleSave = row => {
        axios.patch(`/categories/${row.id}`, {
            title: row.title,
            value: row.title
        }).then(res => {
            console.log('handleSave', row)
            const newData = [...dataSource];
            const index = newData.findIndex(item => row.id === item.id);
            const item = newData[index];
            newData.splice(index, 1, Object.assign(Object.assign({}, item), row));
            setDataSource(newData);
        })
    };
    return (
        <div>
            {contextHolder}
            <Table columns={columns} dataSource={dataSource} rowKey={item => item.id} components={{
                body: {
                    row: EditableRow,
                    cell: EditableCell,
                }
            }}/>
            <Spin spinning={spinning} fullscreen/>
        </div>

    )
}
