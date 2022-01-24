import React  from "react";
import {Button} from 'antd';
import './ImageView.css';

class ImageView extends React.Component {
    constructor(props){
        super(props)
        console.log(props)
        // const {store} = props;
        // const {imgInfo} = store.getState()
        // if(imgInfo.length){
        //     let img = imgInfo[0]
        //     let filename = img['fig_name']
        //     let pid = filename.split('_')[0]
        //     fetch("http://127.0.0.1:5000/img_src/PacificVis/"+pid+'/'+filename,{
        //         method:'get',
        //     })
        //     .then(res => {
        //         console.log(res)
        //         return res.json()
        //     })
        //     .then(data => {
        //         console.log(data)
        //     })
        // }
        
    }
    componentDidMount() {
        this.props.store.subscribe(() => {
            const {imgInfo} = this.props.store.getState()
            if(imgInfo.length){
                let img = imgInfo[0]
                let filename = img['fig_name']
                let pid = filename.split('_')[0]
                fetch("http://127.0.0.1:5000/img_src/PacificVis/"+pid+'/'+filename,{
                    method:'get',
                })
                .then(res => {
                    console.log(res)
                    return res.json()
                })
                .then(data => {
                    console.log(data)
                })
            }
        })
    }
    render() {
        return  (
            <div className="imageview">
                ImageView
                <div className="img-content">
                    this is an image..
                    <img  src="data:;base64,{{ img_stream }}"></img>
                </div>
                <footer>
                    <div className="btns">
                    <Button type='primary'>
                        prev
                    </Button>
                    <Button type='primary'>
                       submit
                    </Button>
                    <Button type='primary'>
                       next
                    </Button>
                    </div>
                   
                </footer>
            </div>
        )
    }
}
export default ImageView;