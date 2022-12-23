import React from 'react'
import {BrowserRouter as Router , Route , Routes} from 'react-router-dom'
import { createBrowserHistory } from "history";

import MyView from '../components/MyView.js'
import Login from '../login.js'
import createStore from '../store/index'

let history = createBrowserHistory()
  
class MyRoute extends React.Component{
    constructor(props){
        super(props)
        this.store = createStore({
            currentPaper: 'VIS',
            username: '',
            token: '',
            imgInfo: [],
            currentImgIndex: 0,
            currentImgUrl: '',
            currentImgInfo: [],
            isEdit: false,
            currentImgAnnos: {},
            editKey: null
        })
    }
    render(){
        return(
            <Router history={history}>
                <Routes>
                    <Route exact path="/" element={<Login store={this.store}/>}></Route>
                    <Route path="/usr" element={<MyView store={this.store}/>} ></Route>
                </Routes>
            </Router>
        )
    }
}
export default MyRoute;