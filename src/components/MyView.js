import React from 'react';
import './MyView.css';
import ImageView from './ImageView';
import ListView from './ListView';


class MyView extends React.Component {
  constructor(props){
    super(props)
    const {store} = props;
    const {token} = store.getState()
    fetch("http://127.0.0.1:5000/tasks",{
            method:'get',
            headers:{
              Token: token
            }
        })
        .then(res => {
            console.log(res)
            return res.json()
        })
        .then(data => {
            console.log(data)
            store.setState({ imgInfo: data.data});
            const {imgInfo} = store.getState()
            console.log(imgInfo)
        })
  }
  username = this.props.store.getState().username
  render(){
    return (
      <div className="App">
        <header className='title'>
          <span>VisImages</span>
          <span className='usrname'>{this.username}</span>
        </header>
          <ImageView store={this.props.store}/>
          <ListView store={this.props.store}/>
      </div>
    );
  }
}

export default MyView;
