import React  from "react";
import {Button} from 'antd';
import './ImageView.css';

class ImageView extends React.Component {
    constructor(props){
        super(props)
        console.log(props)
        this.state = {
            imgurl: ''
        }
    }
    prevImg=()=>{
        const {currentImgIndex, imgInfo} = this.props.store.getState()
        if(currentImgIndex!==0){
            let img = imgInfo[currentImgIndex-1]
            let filename = img['fig_name']
            let pid = filename.split('_')[0]
            const url = "http://127.0.0.1:5000/img_src/PacificVis/"+pid+'/'+filename
            this.props.store.setState({
                currentImgIndex: currentImgIndex-1,
                currentImgUrl: url
            })
        }
    }
    nextImg=()=>{
        const {currentImgIndex, imgInfo} = this.props.store.getState()
        if(currentImgIndex!==imgInfo.length-1){
            let img = imgInfo[currentImgIndex+1]
            let filename = img['fig_name']
            let pid = filename.split('_')[0]
            const url = "http://127.0.0.1:5000/img_src/PacificVis/"+pid+'/'+filename
            this.props.store.setState({
                currentImgIndex: currentImgIndex+1,
                currentImgUrl: url
            })
        }
    }
    componentDidMount() {
        this.props.store.subscribe(() => {
            const {imgInfo, currentImgIndex} = this.props.store.getState()
            if(imgInfo.length){
                let img = imgInfo[currentImgIndex]
                let filename = img['fig_name']
                let pid = filename.split('_')[0]
                const url = "http://127.0.0.1:5000/img_src/PacificVis/"+pid+'/'+filename

                this.setState({
                    imgurl: url
                })
            }
        })
        this.props.store.setState({
            currentImgIndex: 0,
            currentImgUrl: this.state.imgurl
        })
    }
    componentDidUpdate() {
        }
    render() {
        return  (
            <div className="imageview">
                ImageView
                <div className="img-content">
                    <img  className="img" src={this.state.imgurl}  alt=""></img>
                </div>
                <footer>
                    <div className="btns">
                    <Button className="btn" type='primary' onClick={this.prevImg}>
                        Prev
                    </Button>
                    <Button className="btn" type='primary'>
                       Submit
                    </Button>
                    <Button className="btn" type='primary' onClick={this.nextImg}>
                       Next
                    </Button>
                    </div>
                   
                </footer>
            </div>
        )
    }
}
export default ImageView;