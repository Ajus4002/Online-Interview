import {useNavigate} from "react-router-dom";
import {Badge, Card, Drawer, message, Table} from "antd";
import {useEffect, useState} from "react";
import JobAdd from "./JobAdd";
import api from "../../api";
import JobView from "./JobView";


export default function JobList () {
    const navigate = useNavigate()
    const [data, setData] = useState()
    const [loading, setLoading] = useState(false)

    const [selectedRow, setSelectedRow] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [drawerAction, setDrawerAction] = useState('add')

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Level',
            dataIndex: 'level',
            sorter: (a, b) => a.level.localeCompare(b.level),
            filters: [
                { text: 'Junior', value: 'Junior' },
                { text: 'Mid-Level', value: 'Mid-Level' },
                { text: 'Senior', value: 'Senior' },
                { text: 'Intern', value: 'Intern' }
            ],
            onFilter: (value, record) => record.level === value,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type),
            filters: [
                { text: 'Full Time', value: 'Full Time' }, { text: 'Part Time', value: 'Part Time' }
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            sorter: (a, b) => a.skills.localeCompare(b.skills),
        },
        {
            title: 'Status',
            dataIndex: 'isOpen',
            render: (a) => {
                return (
                    <Badge count={a ? 'Open' : 'Closed' } style={{ backgroundColor: a ? 'green' : 'red' }} />
                )
            },
            filters: [
                {
                    text: 'Closed',
                    value: false,
                },
                {
                    text: 'Open',
                    value: true,
                },
            ],
            onFilter: (value, record) => record.isOpen === value,
        }
    ]

    async function loadData() {
        try {
            setLoading(true)
            const res = await api.get('/job')
            setData(res.data.data.map(v => {
                return {...v, skills: v.skills.map(s => s.name).join(', ')}
            }))
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    async function loadOtherData() {
        try {
            setLoading(true)
            const res = await api.get('/skills')

        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    useEffect(() => { loadData(); loadOtherData() }, [])

    function handleAddNewClick(e) {
        e.preventDefault()
        setDrawerAction('add')
        setOpenDrawer(true)
    }

    async function handleOnAdded() {
        setOpenDrawer(false)
        await loadData()
    }

    async function handleOnChanged() {
        await loadData()
    }

    function handleRow(record, rowIndex) {
        return {
            onClick: event => {
                setSelectedRow(record)
                setDrawerAction('view')
                setOpenDrawer(true)
            }
        };
    }

    return (
        <Card title="Jobs" extra={<a href="#" onClick={handleAddNewClick}>Add New</a>}>
            <Table dataSource={data} columns={columns} loading={loading} onRow={handleRow} />

            <Drawer mask={false} visible={openDrawer} onClose={_ => setOpenDrawer(false)}>
                { drawerAction === 'add' && <JobAdd onClose={handleOnAdded}/> }
                { drawerAction === 'view' && <JobView id={selectedRow._id} onChange={handleOnChanged}/> }
            </Drawer>
        </Card>
    )
}
