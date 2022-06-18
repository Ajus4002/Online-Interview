import {Badge, message, Popconfirm, Table} from "antd";
import {useEffect, useState} from "react";
import api from "../../api";


export default function Verification({application, onChange}) {

    const verify = [
        'Experience', 'Skills', 'Email', 'Mobile', 'Address', 'Person', 'Other Details'
    ];

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (val, record) => (
                <>
                    {!record.isVerified && <Popconfirm title={"Verified?"} onConfirm={_ => changeVerification(record.name)} okText="Yes" cancelText="No">
                        <Badge count='Not Verified' style={{backgroundColor: 'red', cursor: "pointer"}} />
                    </Popconfirm> }
                    {record.isVerified && <Badge count='Verified' style={{backgroundColor: 'green', cursor: "pointer"}} />}
                </>
            ),
        },
    ]

    const [data, setData] = useState()

    useEffect(() => {
        if (!application) {
            return
        }

        const ver = verify.map(v => (application.verifications ?? []).find(i => i.name === v) ?? {
            name: v,
            isVerified: false
        })

        setData(ver)
    }, [application])

    async function changeVerification(name) {
        try {
            await api.patch('/application/' + application._id + '/verification', {name, isVerified: true})
            message.success("Updated Successfully")
            onChange()
        } catch (e) {
            message.error(e.response?.message)
        }
    }

    return (
        <Table showHeader={false} columns={columns} dataSource={data}/>
    )
}
