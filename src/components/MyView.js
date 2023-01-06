import React from 'react';
import './MyView.css';
import ImageView from './ImageView';
import ListView from './ListView';
import {message, Button} from 'antd'


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
            message.info("There are no unprocessed tasks.")
        }
    })
  }

  handleClick_logout = () => {
    // TODO navigate to login page
    // localStorage.removeItem('token')
    // localStorage.removeItem('username')
    // message.success('Logout success.')
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
          <Button size='small' className='logout' onClick={this.handleClick_logout}>Logout</Button>
        </header>
          <ImageView store={this.props.store}/>
          <ListView store={this.props.store}/>
      </div>
    );
  }
}

export default MyView;
