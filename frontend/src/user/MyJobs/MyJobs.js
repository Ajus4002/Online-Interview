import {useNavigate} from "react-router-dom";
import {Badge, Card, Drawer, message, Table} from "antd";
import {useEffect, useState} from "react";
// import JobAdd from "./JobAdd";
import api from "../../api";
import JobApplicationView from "./JobApplicationStatusView";
import StatusColors from "../../StatusColors";
// import JobView from "./JobView";


export default function MyJobs () {
    const navigate = useNavigate()
    const [data, setData] = useState()
    const [loading, setLoading] = useState(false)

    const [selectedRow, setSelectedRow] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [drawerAction, setDrawerAction] = useState('add')

    const columns = [
        {
            title: 'Title',
            dataIndex: ['job', 'title'],
            key: "job-title",
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Level',
            dataIndex: ['job', 'level'],
            key: "job-level",
            sorter: (a, b) => a.job.level.localeCompare(b.job.level),
            filters: [
                { text: 'Junior', value: 'Junior' },
                { text: 'Mid-Level', value: 'Mid-Level' },
                { text: 'Senior', value: 'Senior' },
                { text: 'Intern', value: 'Intern' }
            ],
            onFilter: (value, record) => record.job.level === value,
        },
        {
            title: 'Type',
            dataIndex: ['job', 'type'],
            key: "job-type",
            sorter: (a, b) => a.job.type.localeCompare(b.job.type),
            filters: [
                { text: 'Full Time', value: 'Full Time' }, { text: 'Part Time', value: 'Part Time' }
            ],
            onFilter: (value, record) => record.job.type === value,
        },
        {
            title: 'Experience',
            dataIndex: ['job', 'experience'],
            key: "job-type",
            sorter: (a, b) => a - b,
            render: (a) => <span>{a}+</span>,
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            render: (a) => <span>{a.map(v => v.name).join(', ')}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (a) => <Badge count={a} style={{ backgroundColor: StatusColors[a] }} />,
            filters: [
                { text: 'Pending',  value: 'Pending',},
                { text: 'Ongoing',  value: 'Ongoing',},
                { text: 'Rejected', value: 'Rejected',},
                { text: 'Selected', value: 'Selected',},
                { text: 'Closed',   value: 'Closed',},
            ],
            onFilter: (value, record) => record.status === value,
        }
    ]

    async function loadData() {
        try {
            setLoading(true)
            const res = await api.get('/users/jobs/my')
            setData(res.data.data)
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

    useEffect(() => { loadData(); }, [])

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
        <Card title="My Job Applications">
            <Table dataSource={data} columns={columns} loading={loading} onRow={handleRow} />

            <Drawer width={'80vw'} visible={openDrawer} onClose={_ => setOpenDrawer(false)}>
                <JobApplicationView application={selectedRow}/>
            </Drawer>
        </Card>
    )
}
