import {Badge, DatePicker, Form, Input, InputNumber, message, Select, Table} from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";
import moment from "moment";
import api from "../../api";
const EditableContext = React.createContext(null);

let accounts = null;
async function getAccounts() {
    if (accounts !== null) {
        return accounts
    }

    const res = await api.get('/accounts')
    accounts = res.data.data;
    return accounts;
}


export default function InterviewTable({application, interviewStats, onChange}) {
    const defaultColumns = [
        {
            title: 'Level',
            dataIndex: 'level',
            render: (text, record) => (<span style={{color: record.isEmpty ? '#ccc' : '#000'}}>{text}</span>)
        },
        {
            title: 'Scheduled On',
            dataIndex: 'scheduledOn',
            render: text => text ? moment(text).calendar() : '',
            editable: true,
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            editable: true,
        },
        {
            title: 'Attended On',
            dataIndex: 'attendedOn',
            render: text => text ? moment(text).calendar() : '',
            editable: true,
        },
        {
            title: 'Interviewed By',
            dataIndex: 'interviewedBy',
            editable: true,
        },
        {
            title: 'Score',
            dataIndex: 'score',
            editable: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (a) => <Badge count={a} style={{backgroundColor: a === 'Pass' ? "green" : 'red'}}/>,
            editable: true,
        },
    ];

    useEffect(() => {
        getAccounts().then()
    }, [])


    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    async function handleSave(record, dataIndex) {
        try {
            await api.patch('/application/' + application._id + '/interview', {[dataIndex]: record[dataIndex], level: record['level']})
            message.success("Updated Successfully")
            onChange()
        } catch (e) {
            message.error(e.response?.message)
        }
    }

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    return (
        <Table rowClassName="editable-row" bordered components={components} columns={columns} dataSource={interviewStats} summary={(pageData) => {
            if (!pageData.length) {
                return null
            }

            return (
                <>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}/>
                        <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>{ interviewStats.reduce((acc, v) => acc + parseInt(v.score ?? 0), 0) }</Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    </Table.Summary.Row>
                </>
            );
        }}/>
    )
}

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
    const inputRef = useRef(null);
    const form = useContext(EditableContext);

    const [accounts, setAccounts] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getAccounts().then(v => setAccounts(v))

        if (record) {
            let value = record[dataIndex]

            if (['scheduledOn', 'attendedOn'].includes(dataIndex)) {
                value = value ? moment(value) : value
            } else if (['assignedTo', 'interviewedBy'].includes(dataIndex)) {
                value = value ? value._id : value
            }

            form.setFieldsValue({
                [dataIndex]: value,
            });
        }
    }, []);

    const toggleEdit = () => {
/*        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });*/
    };

    const save = async () => {
        setLoading(true)
        try {
            const values = await form.validateFields();
            toggleEdit();
            await handleSave({ ...record, ...values }, dataIndex);
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
        setLoading(false)
    };

    let childNode = children;

    let cellEditable = !['scheduledOn', 'assignedTo'].includes(dataIndex)
        ? record?.isFullEditable
        : true

    if (record?.['level'] === 'Online Interview' && (['attendedOn', 'interviewedBy'].includes(dataIndex))) {
        cellEditable = false
    }

    if (editable && record?.isEditable && cellEditable) {
        const inputProps = {
            ref: inputRef,
            onChange: save
        }

        let input = null

        switch (dataIndex) {
            case 'scheduledOn':
            case 'attendedOn':
                input = <DatePicker format={'YYYY-MM-DD'} {...inputProps}/>
                break;

            case 'assignedTo':
            case 'interviewedBy':
                input = <Select {...inputProps}>
                    { accounts?.map(v => <Select.Option value={v._id}>{v.name}</Select.Option>) }
                </Select>
                break;

            case 'status':
                input = <Select {...inputProps}>
                    <Select.Option value={'Pass'}>Pass</Select.Option>
                    <Select.Option value={'Fail'}>Fail</Select.Option>
                </Select>
                break;

            case 'score':
                input = <InputNumber {...inputProps}/>
                break;

            default:
                input = <Input {...inputProps} />
        }

        childNode = (
            <Form.Item style={{ margin: 0, }} name={dataIndex}>
                {input}
            </Form.Item>
        )
    } else {
        if (['assignedTo', 'interviewedBy'].includes(dataIndex) && record[dataIndex]) {
            childNode = record[dataIndex].name
        }
    }

    return <td {...restProps}>{childNode}</td>;
};
