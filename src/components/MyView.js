import React from 'react';
import './MyView.css';
import ImageView from './ImageView';
import ListView from './ListView';
import TaskView from './TaskView';
import {message} from 'antd'
import {TASK_VERIFY_IMAGE, TASK_VERIFY_VISUALIZATION} from '../config'

class MyView extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      username: '',
    }
  }

  loadTasks(){
    const { store } = this.props;
    const { token } = store.getState();
    fetch("http://127.0.0.1:5000/previous_tasks",{
      method:'get',
      headers:{
          Token: token,
      }
    })
    .then(res => {
        return res.json()
    })
    .then(data => {
        const taskData = data.data;
        if(taskData.length){
          const taskType = taskData[0].task_type.startsWith(TASK_VERIFY_VISUALIZATION) ? TASK_VERIFY_VISUALIZATION : taskData[0].task_type
          store.setState({
            taskInfo: taskData,
            taskType: taskType,
            annType: taskType === TASK_VERIFY_VISUALIZATION ? taskData[0].ann_type : '',
            pageNum: taskType === TASK_VERIFY_IMAGE ? taskData[0].page_num : 0
          });
        } else {
            message.info("There are no unprocessed tasks.")
        }
    })
  }

  componentDidMount(){
    if(localStorage.getItem('token')) {
      const {store} = this.props;
      store.setState({
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username')
      });
      this.setState({
        username: localStorage.getItem('username')
      })
      this.loadTasks()
    } else {
      message.error("Invalid user information, please log in again")
    }
  }

  render(){
    return (
      <div className="App">
        <header className='title'>
          <span>VisImages</span>
          <span className='usrname'>{this.state.username}</span>
        </header>
          <ImageView store={this.props.store}/>
          <TaskView store={this.props.store}/>
          <ListView store={this.props.store}/>
      </div>
    );
  }
}

export default MyView;
