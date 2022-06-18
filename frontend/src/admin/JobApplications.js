import {useNavigate} from "react-router-dom";
import {Badge, Button, Card, Drawer, message, Modal, Table} from "antd";
import {useEffect, useState} from "react";
import api from "../api";
import StatusColors from "../StatusColors";
import InterviewLevelColors from "../InterviewLevelColors";
import moment from "moment";
import {CreditCardOutlined, DeleteOutlined, DotChartOutlined, EditOutlined, EyeOutlined} from "@ant-design/icons";
import JobPosting from "../components/JobPosting";
import JobApplication from "../components/JobApplication";


export default function JobApplications () {
    const navigate = useNavigate()
    const [data, setData] = useState()
    const [loading, setLoading] = useState(false)

    const [selected, setSelected] = useState(null)

    const [columns, setColumns] = useState([
        {
            title: 'Title',
            dataIndex: ['job', 'title'],
            key: "job-title",
            sorter: (a, b) => a.job.title.localeCompare(b.job.title),
            filters: [],
            onFilter: (value, record) => record.job._id === value, //todo
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            onFilter: (value, record) => record.name === value,
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            render: (a) => <span>{a.map(v => v.name).join(', ')}</span>,
        },
        {
            title: 'Experience',
            dataIndex: 'xp',
            sorter: (a, b) => b - a,
            render: (a) => <span>{Math.floor(a)}+</span>,
        },
        {
            title: 'Interview Level',
            dataIndex: 'interviewLevel',
            filters: Object.keys(InterviewLevelColors).map(v => ({text: v, value: v})),
            onFilter: (value, record) => record.status === value,
            render: (a) => <span style={{color: InterviewLevelColors[a]}}>{a}</span>, //todo
        },
        {
            title: 'Status',
            dataIndex: 'status',
            filters: Object.keys(StatusColors).map(v => ({text: v, value: v})),
            onFilter: (value, record) => record.status === value,
            render: (a) => <Badge count={a} style={{ backgroundColor: StatusColors[a] }} />,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (val, record) => (
                <>
                    <Button type="link" onClick={_ => navigate('/admin/applications/' + record._id)} icon={<EyeOutlined />}/>
                    <Button type="link" onClick={_ => openJobModel(record)} icon={<CreditCardOutlined />}/>
                    <Button type="link" onClick={_ => openApplicationModel(record)} icon={<DotChartOutlined />}/>
                </>
            ),
        },
    ])

    async function loadData() {
        try {
            setLoading(true)
            const res = await api.get('/applications')

            res.data.data.forEach(d => {
                d.xp = d.experience?.reduce((acc, v) => {
                    const from = moment(v.from).startOf('month')
                    const to = moment(v.to ?? undefined).endOf('month')

                    return acc + to.diff(from, 'month', true)
                }, 0) / 12

                d.interviewLevel = ((d.interviewStats ?? []).at(-1) ? d.interviewStats.at(-1).level : '')
            })

            columns[0].filters = res.data.data.map(v => ({text: v.job.title, value: v.job._id}))
            setColumns([...columns])

            setData(res.data.data)
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    useEffect(() => { loadData();  }, [])

    const [showJobPosting, setShowJobPosting] = useState(false);
    const [showJobApplication, setShowJobApplication] = useState(false);

    function closeModel() {
        setShowJobPosting(false)
        setShowJobApplication(false)
    }

    function openApplicationModel(data) {
        setSelected(data)
        setShowJobApplication(true)
    }

    function openJobModel(data) {
        setSelected(data)
        setShowJobPosting(true)
    }

    return (
        <Card title="Job Applications">
            <Table dataSource={data} columns={columns} loading={loading}/>

            <Modal title="Job Posting" onOk={closeModel} onCancel={closeModel} cancelButtonProps={{ hidden: true }} visible={showJobPosting}>
                { selected && <JobPosting job={selected.job}/> }
            </Modal>

            <Modal title="Job Application" onOk={closeModel} onCancel={closeModel} cancelButtonProps={{ hidden: true }} visible={showJobApplication}>
                { selected && <JobApplication application={selected}/> }
            </Modal>
        </Card>
    )
}
