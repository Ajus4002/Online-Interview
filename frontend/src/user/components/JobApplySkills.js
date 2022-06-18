import {Card, Select, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import api from "../../api";

export default function JobApplySkills({data, onChange}) {
    const [isInputShown, setIsInputShown] = useState(false)
    const [skills, setSkills] = useState([])
    const [allSkills, setAllSkills] = useState([])

    async function addSkill(skill) {
        setIsInputShown(false)

        if (!skill?.length) {
            return
        }

        skill = skill[0]
        if (!skill.label && !skill.value) {
            return
        }

        const find = skills.find(v => v._id.toLowerCase() === skill.value.toLowerCase())
        if (!find) {
            setSkills([...skills, {_id: skill.value, name: skill.label ?? skill.value}])
        }
    }

    async function removeSkill(skill) {
        if (!skill) return

        setSkills(skills.filter(v => v._id !== skill._id))
    }

    useEffect(() => {
        if (data) {
            setSkills([...data])
        }
    }, [data])

    useEffect(() => {
        onChange(skills)
    }, [onChange, skills])

    useEffect(() => {
        api.get('/skills').then(res => {
            setAllSkills(res.data.data)
        })
    }, [])

    function filterSkills(inp, option) {
        return option.children.toLowerCase().startsWith(inp.toLowerCase())
    }

    function renderTag(tag) {
        return <Tag
            className="edit-tag"
            key={tag._id}
            closable={true}
            onClose={() => removeSkill(tag)}
            style={{ marginBottom: 16 }}
        >
              <span>
                {tag.name > 20 ? `${tag.name.slice(0, 20)}...` : tag.name}
              </span>
        </Tag>
    }

    return (
        <Card title="Skills">
            { skills.map(v => renderTag(v)) }

            { isInputShown && <Select
                mode="tags"
                maxTagCount={1}
                placeholder="Add Skills"
                onChange={addSkill}
                onBlur={e => addSkill([{label: e.target.value, value: e.target.value}])}
                size="small"
                style={{ width: 78 }}
                autoFocus={true}
                labelInValue={true}
                showSearch={true}
                filterOption={filterSkills}
            >
                { allSkills.map(v => <Select.Option value={v._id} key={v._id}>{v.name}</Select.Option>) }
            </Select>}

            {!isInputShown && (
                <Tag color={"success"} onClick={() => setIsInputShown(true)} className="site-tag-plus">
                    <PlusOutlined /> New Skill
                </Tag>
            )}
        </Card>
    )
}
