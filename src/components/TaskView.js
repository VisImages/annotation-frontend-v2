import React  from "react";
import './TaskView.css'

import {Tag} from 'antd';
import { TASK_VERIFY_VISUALIZATION } from "../config";
class TaskView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            taskType: '',
            annType: ''
        }
    }

    componentDidMount() {
        this.props.store.subscribe(() => {
            const {taskType, annType} = this.props.store.getState()
            this.setState({
                taskType: taskType,
                annType: annType
            })
        })
    }

    render() {
        return  (
            <div className="taskview">
                TaskView
                <div>
                    <Tag
                        className="tag"
                        color='blue'>
                        TaskType: {this.state.taskType}
                    </Tag>
                    <Tag
                        className="tag"
                        color='pink'
                        visible={this.state.taskType === TASK_VERIFY_VISUALIZATION ? true : false}>
                        AnnType: {this.state.annType}
                    </Tag>
                </div>
            </div>
        )
    }
}

export default TaskView;