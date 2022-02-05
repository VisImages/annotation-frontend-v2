import React  from "react";
import {Button, Modal} from 'antd';
import './ImageView.css';
import { Group, Image, Layer, Stage } from "react-konva";
import Rects from "./Rects";
import useImage from 'use-image';

let scale;

const AnnosImage = ({ image, store, maxW, maxH }) => {
    const [img] = useImage(image);
    let width = img?img.width:600
    let height = img?img.height:600
    
    let nextscale = img?(width/maxW > height/maxH?width/maxW:height/maxH):4
    if(scale!==nextscale){
        scale = nextscale
    }
    console.log(scale)

    return (
        <Layer>
            <Image
                image={img}
                // x={image.x}
                // y={image.y}
                width={img ? img.width/scale:600}
                height={img? img.height/scale:600}
                // I will use offset to set origin to the center of the image
                // offsetX={img ? img.width / 2 : 0}
                // offsetY={img ? img.height / 2 : 0}
            />
            <Rects store={store} scale={scale}></Rects>
        </Layer>
      
    );
  };
class ImageView extends React.Component {
    constructor(props){
        super(props)
        console.log(props)
        this.myImg = React.createRef()
        this.myImgContainer = React.createRef()
        this.stageRef = React.createRef()
        this.state = {
            imgurl: '',
            isPainting: false,
            isModalVisible: false,
        }
        scale = 4
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
                currentImgUrl: url,
                // img: useImage(url)
                currentImgInfo: [],
                isEdit: false
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
                currentImgUrl: url,
                // img: useImage(url)
                currentImgInfo: [],
                isEdit: false
            })
        }
    }
    submitAnnos=()=>{
        let {imgInfo, currentImgIndex, currentImgInfo} = this.props.store.getState()
        console.log(imgInfo[currentImgIndex])
        console.log(currentImgInfo)
        let data = imgInfo[currentImgIndex]
        let annos = {}
        currentImgInfo.forEach((type)=>{
            let boxes = []
            type.children.forEach((item)=>{
                boxes.push(item.bbox)
            })
            annos[type.key] = boxes
        })
        data.annotations = annos
        console.log(data)
        const {token} = this.props.store.getState()
        console.log(token)
        fetch("http://127.0.0.1:5000/task",{
            method:'post',
            headers:{
              Token: token,
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            console.log(res)
            return res.json()
        })
        .then(data => {
            console.log(data)
        })
        imgInfo.splice(currentImgInfo,1)
        this.props.store.setState({
            imgInfo: [...imgInfo],
            currentImgInfo: []
        })
        
        if(!this.props.store.getState().imgInfo.length){
            this.showModal()
        }
        
    }
    getRelativePointerPosition(node) {
    // the function will return pointer position relative to the passed node
        const transform = node.getAbsoluteTransform().copy();
        // to detect relative position we need to invert transform
        transform.invert();
        
        // get pointer (say mouse or touch) position
        const pos = node.getStage().getPointerPosition();
        
        // now we find relative point
        return transform.point(pos);
    }
    onMouseDown=(e)=>{
        const {editKey, currentImgInfo}=this.props.store.getState()
        if(editKey!==''){
            this.setState({
                isPainting: true
            })
        }else{
            return
        }
        const point = this.getRelativePointerPosition(e.target.getStage());
        console.log(point)
        currentImgInfo.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                if(item.key===editKey){
                    console.log(item)
                    item.bbox[0]=point.x*scale
                    item.bbox[1]=point.y*scale
                }
            })
        }) 
        this.props.store.setState({
            currentImgInfo: [...currentImgInfo],
        })
    }
    onMouseMove=(e)=>{
        if(!this.state.isPainting){
            return
        }
        const {editKey, currentImgInfo}=this.props.store.getState()
        const point = this.getRelativePointerPosition(e.target.getStage());
        console.log(point)
        currentImgInfo.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                if(item.key===editKey){
                    console.log(item)
                    item.bbox[2]=point.x*scale
                    item.bbox[3]=point.y*scale
                }
            })
        }) 
        this.props.store.setState({
            currentImgInfo: [...currentImgInfo],
        })
    }
    onMouseUp=(e)=>{
        this.setState({
            isPainting: false
        })
        this.props.store.setState({
            editKey: ''
        })
    }

    showModal = () => {
        this.setState({
            isModalVisible: true
        })
    }

    handleOk = () => {
        const { store } = this.props;
        const {token} = store.getState()
        console.log(token)
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
        
        this.setState({
            isModalVisible: false
        })
    }

    handleCancel = () => {
        this.setState({
            isModalVisible: false
        })
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
                    imgurl: url,
                    // img: useImage(url)
                })
            }
            
        })
        this.props.store.setState({
            currentImgIndex: 0,
            currentImgUrl: this.state.imgurl,
            // currentImgInfo: imgInfo[currentImgIndex].annotations
        })
        console.log(this.myImgContainer) 
     }
    
    render() {
        return  (
            <div className="imageview">
                ImageView
                <Modal title="继续"
                       visible={this.state.isModalVisible}
                       onOk={this.handleOk}
                       onCancel={this.handleCancel} >
                    <p>继续领取任务？</p>
                </Modal>
                <div ref={this.myImgContainer} className="img-content">
                    {/* <img  className="img" src={this.state.imgurl}  alt=""></img> */}
                    <Stage
                        ref={this.stageRef}
                        width={this.myImgContainer.current?this.myImgContainer.current.clientWidth:window.innerWidth} 
                        height={this.myImgContainer.current?this.myImgContainer.current.clientHeight:window.innerHeight}
                        onMouseDown={(e)=>{this.onMouseDown(e)}}
                        onMouseMove={(e)=>{this.onMouseMove(e)}}
                        onMouseUp={(e)=>{this.onMouseUp(e)}}
                        >

                        {/* <BaseImage store={this.props.store}/> */}
                        <AnnosImage
                            image={this.state.imgurl} 
                            store={this.props.store}
                            maxW={this.myImgContainer.current?this.myImgContainer.current.clientWidth:window.innerWidth}
                            maxH={this.myImgContainer.current?this.myImgContainer.current.clientHeight:window.innerHeight}
                        />
                        
                   
                    </Stage>


                </div>
                <footer>
                    <div className="btns">
                    <Button className="btn" type='primary' onClick={this.prevImg}>
                        Prev
                    </Button>
                    <Button className="btn" type='primary' onClick={this.submitAnnos}>
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