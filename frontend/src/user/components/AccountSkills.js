import {Button, Card, Col, Row, Select, Tag, message, Empty} from "antd";
import {EditFilled, CloseOutlined, PlusOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";

export default function AccountSkills({data, onChange}) {
    const [isEdit, setIsEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isInputShown, setIsInputShown] = useState(false)
    const [skills, setSkills] = useState([])
    const [allSkills, setAllSkills] = useState([])

    async function addSkill(newSkill) {
        if (!newSkill?.length) {
            setIsInputShown(false)
            return
        }

        try {
            setLoading(true)
            await api.post('/users/skills', {skill: newSkill[0].value})
            setIsInputShown(false)
            setSkills([...skills, {_id: '', name: newSkill[0].label}])
            onChange()

            message.success("Skill added successfully")
        } catch (e) {
            message.error(e.response?.data.message);
        } finally {
            setLoading(false)
        }
    }

    async function removeSkill(skill) {
        if (!skill) return

        try {
            setLoading(true)
            await api.delete('/users/skills/' + skill._id)

            message.success("Skill deleted successfully")
        } catch (e) {
            message.error(e.response?.data.message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (data.skills) {
            setSkills([...data.skills])
        }
    }, [data])

    useEffect(() => {
        api.get('/skills').then(res => {
            setAllSkills(res.data.data)
        })
    }, [])

    function filterSkills(inp, option) {
        return option.children.toLowerCase().startsWith(inp.toLowerCase())
    }

    function renderEditButton() {
        return !isEdit
            ? <Button type="link" htmlType="button" icon={<EditFilled />} onClick={() => setIsEdit(true)}/>
            : <Button type="link" htmlType="reset" icon={<CloseOutlined />} onClick={() => setIsEdit(false)}/>
    }

    function renderTag(tag) {
        return <Tag
            className="edit-tag"
            key={tag._id}
            closable={tag._id && isEdit}
            onClose={() => removeSkill(tag)}
            style={{ marginBottom: 16 }}
        >
              <span>
                {tag.name > 20 ? `${tag.name.slice(0, 20)}...` : tag.name}
              </span>
        </Tag>
    }

    return (
        <Card title="Skills" extra={renderEditButton()}>
            <Row gutter={16}>
                <Col span={24}>
                    { !skills?.length && !isEdit && <Empty />}

                    { skills.map(v => renderTag(v)) }

                    { isInputShown && isEdit && <Select
                        mode="tags"
                        maxTagCount={1}
                        placeholder="Add Skills"
                        onChange={addSkill}
                        onBlur={e => addSkill({label: e.target.value, value: e.target.valueO})}
                        size="small"
                        style={{ width: 78 }}
                        loading={loading}
                        autoFocus={true}
                        labelInValue={true}
                        showSearch={true}
                        filterOption={filterSkills}
                    >
                        { allSkills.map(v => <Select.Option value={v._id}>{v.name}</Select.Option>) }
                    </Select>}

                    {!isInputShown && isEdit && (
                        <Tag color={"success"} onClick={() => setIsInputShown(true)} className="site-tag-plus">
                            <PlusOutlined /> New Skill
                        </Tag>
                    )}
                </Col>
            </Row>
        </Card>
    )
}
