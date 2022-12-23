import React from "react";
import { Input, Button} from 'antd';
// import { Icon } from '@ant-design/compatible';

import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login(props){
    let navigate =  useNavigate()
    let usrname = ''

    function handleSubmit(){
        fetch("http://127.0.0.1:5000/user/"+usrname,{
            method:'get'
        })
        .then(res => {
            console.log(res)
            return res.text()
        })
        .then(data => {
            const { store } = props;
            store.setState({ username: usrname, token:data });
            // const {username, token} = store.getState()
            // console.log(username, token)
            // const {store} = props;
            const {token} = store.getState()
            console.log(token)

            fetch("http://127.0.0.1:5000/previous_tasks",{
                    method:'get',
                    headers:{
                        Token: token,
                    }
                })
                .then(res => {
                    console.log(res)
                    return res.json()
                })
                .then(data => {
                    console.log(data)
                    if(data.data.length){
                        store.setState({ imgInfo: data.data});
                        const {imgInfo} = store.getState()
                        console.log(imgInfo)
                    }else{
                        fetch("http://127.0.0.1:5000/tasks",{
                            method:'get',
                            headers:{
                                Token: token,
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
                })
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