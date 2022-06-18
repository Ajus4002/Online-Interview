import {useNavigate} from "react-router-dom";
import {Badge, Button, Card, Drawer, message, Table} from "antd";
import {useEffect, useRef, useState} from "react";
import api from "../api";

export default function JobList () {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const [accounts, setAccounts] = useState([])
    const [posts, setPosts] = useState([])
    const me = useRef(null)

    const [columns, setColumns] = useState([
        {
            title: 'Candidate',
            dataIndex: ['user', 'name'],
            sorter: (a, b) => a.user.name.localeCompare(b.user.name),
        },
        {
            title: 'Post',
            dataIndex: ['post', 'title'],
            sorter: (a, b) => a.post.title.localeCompare(b.post.title),
            filters: [],
            onFilter: (value, record) => record.post.id === value,
        },
        {
            title: 'Assigned To',
            dataIndex: ['assignedTo', 'name'],
            sorter: (a, b) => a.assignedTo.name.localeCompare(b.assignedTo.name),
            filters: [],
            onFilter: (value, record) => record.assignedTo.id === value,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (val, record) => (
                <>
                    <Button type="link" onClick={_ => navigate('/admin/applications/' + record.id + '/interview')}>Join</Button>
                </>
            ),
        },
    ])

    const [socket, setSocket] = useState(null)

    function connectSocket() {
        if (socket) {
            return
        }

        const webSocket = new WebSocket('ws://' + api.defaults.baseURL.split('//')[1] + 'socket?type=admin&token=' + localStorage.getItem('admin.token'));
        webSocket.onmessage = e => processMessage(JSON.parse(e.data));
        webSocket.onopen = _ => webSocket.send(JSON.stringify({ subject: 'get-active-clients', to: 'server' }));
        webSocket.onclose = _ => setSocket(null)
        setSocket(webSocket)
    }

    function processMessage(msg) {
        switch (msg['subject']) {
            case 'client-connected':
                if (msg['client'].assignedTo.id === me.current._id) {
                    setData([...data, msg['client']])
                }
                break;

            case 'client-disconnected':
            case 'client-session-started':
            case 'client-session-finished':
                setData(data.filter(v => v.id === msg['client']['id']))
                break;

            case 'active-clients':
                setData(msg['clients'].filter(client => client.assignedTo.id === me.current._id))
        }
    }

    async function loadData() {
        try {
            setLoading(true)
            me.current = JSON.parse(localStorage.getItem('admin'))
            connectSocket()
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    async function loadOtherData() {
        try {
            setLoading(true)
            const res = await api.get('/accounts')
            setAccounts(res.data.data)
            const res1 = await api.get('/job')
            setPosts(res1.data.data)
        } catch (e) {
            message.error("Error")
        }
        setLoading(false)
    }

    useEffect(() => { loadData(); loadOtherData() }, [])

    useEffect(() => {
        columns[2].filters = accounts.map(v => ({text: v.name, value: v._id}))
        setColumns(columns)
    }, [accounts])

    useEffect(() => {
        columns[1].filters = posts.map(v => ({text: v.title, value: v._id}))
        setColumns(columns)
    }, [posts])

    return (
        <Card title="Interviews" extra={!socket && <Badge count={"Disconnected"} style={{backgroundColor: "red"}}/>}>
            <Table dataSource={data} columns={columns} loading={loading} />
        </Card>
    )
}
