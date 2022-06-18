import {Card, Form, message, Tabs} from "antd";
import InterviewLevelColors from "../../InterviewLevelColors";
import {useEffect, useState} from "react";
import TextArea from "antd/es/input/TextArea";
import api from "../../api";

export default function InterviewDetails({ application, interviewStats, onChange }) {
    const [activeKey, setActiveKey] = useState(Object.keys(InterviewLevelColors)[0]);

    useEffect(() => {
        if (!interviewStats) {
            return
        }

        const found = [...interviewStats].reverse().find(v => v.isEditable)
        if (found) {
            setActiveKey(found.level)
        }
    }, [interviewStats])

    async function onRemarksChange(level, remarks) {
        try {
            await api.patch('/application/' + application._id + '/interview', {remarks, level})
            message.success("Updated Successfully")
            onChange()
        } catch (e) {
            message.error(e.response?.message)
        }
    }

    if (!interviewStats) {
        return 'Loading...'
    }

    return <Tabs activeKey={activeKey} onChange={e => setActiveKey(e)}>
        { interviewStats.map(v =>
            <Tabs.TabPane tab={v.level} key={v.level} disabled={v.isEmpty}>
                <b>Remarks</b>
                <TextArea deafultValue={v.remarks} autoSize disabled={v.isEmpty} style={{minHeight: '100px'}} onBlur={e => onRemarksChange(v.level, e.target.value)}/>

                { v.level === "Online Interview" && application.questions.length &&
                    <Card title="Questions" className="mt-10">
                        { application.questions.map(v => <div key={v._id} className="question-item">
                            <p className="question text-bold">{ v.question }</p>
                            <p className="answer">{ v.answer }</p>
                        </div>) }
                    </Card>
                }
            </Tabs.TabPane>)
        }
    </Tabs>
}
