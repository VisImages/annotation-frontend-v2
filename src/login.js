import React from "react";
import {Form,Input, Button} from 'antd';
// import { Icon } from '@ant-design/compatible';

import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login(props){
    let navigate =  useNavigate()
    let usrname = ''

    function handleSubmit(){
        fetch("http://127.0.0.1:5000/usr/"+usrname,{
            method:'get'
        })
        .then(res => {
            console.log(res)
            return res.text()
        })
        .then(data => {
            const { store } = props;
            store.setState({ username: usrname, token:data });
            const {username, token} = store.getState()
            console.log(username, token)
        })
        navigate('/usr',{replace:true})
    }

    function onChange(e){
        let val = e.target.value
        usrname = val
    }
        // const { getFieldDecorator,  getFieldError, isFieldTouched } = this.props.form;
        // const userNameError = isFieldTouched('userName') && getFieldError('userName');
        return(
            <div className="login">
                <div className="login-form">
                    <div className="login-name">VisImages</div>
                    <Input className="username" 
                            size="large" 
                            placeholder="user name" 
                            prefix={<UserOutlined />}
                            defaultValue={usrname} 
                            onChange={(e)=>onChange(e)}
                            />
                    <br/>
                    <Button className="btn" type="primary"  onClick={handleSubmit} >登录 </Button>
                   
                </div>
            </div>
        )
}
export default Login;