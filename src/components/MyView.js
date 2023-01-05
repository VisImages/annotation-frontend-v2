import React from 'react';
import './MyView.css';
import ImageView from './ImageView';
import ListView from './ListView';
import {message} from 'antd'


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
            store.setState({
              taskInfo: taskData,
              taskType: taskData[0].task_type
            });
        } else {
            fetch("http://127.0.0.1:5000/tasks",{
                method:'get',
                headers:{
                    Token: token,
                }
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const taskData = data.data
                store.setState({
                  taskInfo: taskData
                });
                if(taskData.length === 0) {
                  message.info("There are no tasks to be assigned.")
                } else {
                    message.success("Get Tasks success, cnt is " + taskData.length + ".")
                    store.setState({
                      taskType: taskData[0].task_type
                    });
                }
            })
        }
    })
  }

  componentDidMount(){
    if(localStorage.getItem('token')) {
      const {store} = this.props;
      store.setState({
        token: localStorage.getItem('token'),
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
          <ListView store={this.props.store}/>
      </div>
    );
  }
}

export default MyView;
