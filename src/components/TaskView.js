import React  from "react";
import './TaskView.css'

import {Tag} from 'antd';
class TaskView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            taskType: '',
        }
    }

    componentDidMount() {
        this.props.store.subscribe(() => {
            const {taskType} = this.props.store.getState()
            this.setState({
                taskType: taskType
            })
        })
    }

    render() {
        return  (
            <div className="taskview">
                TaskView
                <div>
                    <Tag className="tag" color='blue'> TaskType: {this.state.taskType}</Tag>
                </div>
            </div>
        )
    }
}

export default TaskView;