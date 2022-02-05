import React from 'react';
import './MyView.css';
import ImageView from './ImageView';
import ListView from './ListView';


class MyView extends React.Component {
  constructor(props){
    super(props)
   
  }
  componentDidMount(){
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
