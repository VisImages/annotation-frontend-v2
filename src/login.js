import React from "react";
import { Input, Button} from 'antd';
// import { Icon } from '@ant-design/compatible';

import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login(props){
    let navigate =  useNavigate()
    let usrname = ''

    async function handleSubmit(){
        await fetch("http://127.0.0.1:5000/user/" + usrname,{
            method:'get'
        })
        .then(res => {
            return res.text()
        })
        .then(data => {
            const { store } = props;
            store.setState({ username: usrname, token:data });
            //persist userinfo
            localStorage.setItem('token', data);
            localStorage.setItem('username', usrname);
        })
        navigate('/usr', {replace:true})
    }

    function onChange(e){
        let val = e.target.value
        usrname = val
    }

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
                <Button className="btn" type="primary"  onClick={handleSubmit} >Login </Button>
            </div>
        </div>
    )
}
export default Login;