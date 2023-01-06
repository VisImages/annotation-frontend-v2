import React  from "react";
import {Button, Modal, Result, message, Radio} from 'antd';
import './ImageView.css';
import { Image, Layer, Stage } from "react-konva";
import Rects from "./Rects";
import useImage from 'use-image';
import { SmileOutlined } from "@ant-design/icons";

let scale;
const TASKALLDONE = 'All Tasks are done.'
const taskOptions = [
    {label: 'AnnotationPage', value: 'AnnotationPage'},
    {label: 'AnnotationImage', value: 'AnnotationImage'},
    {label: 'VerifyImage', value: 'VerifyImage'},
]

const AnnosImage = ({ image, store, maxW, maxH }) => {
    const [img] = useImage(image);
    let width = img ? img.width : 600
    let height = img ? img.height : 600

    let nextscale = img ? (width/maxW > height/maxH ? width/maxW : height/maxH) : 4
    if(scale !== nextscale){
        scale = nextscale
    }

    return (
        <Layer>
            <Image
                image={img}
                width={img ? img.width/scale : 600}
                height={img ? img.height/scale : 600}
            />
            <Rects store={store} scale={scale}></Rects>
        </Layer>
    );
  };
class ImageView extends React.Component {
    constructor(props){
        super(props)
        this.myImg = React.createRef()
        this.myImgContainer = React.createRef()
        this.stageRef = React.createRef()
        this.state = {
            imgURL: '',
            isPainting: false,
            isContinueModalVisible: false,
            isTaskEmpty: true,
            taskOptionValue: 'VerifyImage'
        }
        scale = 4
    }
    prevTask=()=>{
        // get the previous task
        const {currentTaskIndex, taskInfo} = this.props.store.getState()
        if( currentTaskIndex !== 0 ){
            let task = taskInfo[currentTaskIndex-1]
            let filename = task['fig_name']
            let pid = filename.split('_')[0]
            const url = "http://127.0.0.1:5000/img_src/"+ pid + '/' + filename
            this.props.store.setState({
                currentTaskIndex: currentTaskIndex-1,
                currentImgURL: url,
                currentAnnoInfo: [],
                taskType: taskInfo[currentTaskIndex-1].task_type,
                isEdit: false
            })
        } else {
            message.warn('This is the first image.');
        }
    }
    nextTask=()=>{
        // get the next task
        const {currentTaskIndex, taskInfo} = this.props.store.getState()
        if(taskInfo.length !== 0 && currentTaskIndex !== taskInfo.length-1){
            let task = taskInfo[currentTaskIndex+1]
            let filename = task['fig_name']
            let pid = filename.split('_')[0]
            const url = "http://127.0.0.1:5000/img_src/" + pid + '/' + filename
            this.props.store.setState({
                currentTaskIndex: currentTaskIndex+1,
                currentImgURL: url,
                currentAnnoInfo: [],
                taskType: taskInfo[currentTaskIndex+1].task_type,
                isEdit: false
            })
        } else if (taskInfo.length !== 0) {
            message.warn('This is the last task.');
        } else {
            console.log("isTaskEmpty: true");
            this.setState({
                isTaskEmpty: true
            });
        }
    }

    submitAnnos=()=>{
        const {taskInfo, currentTaskIndex, currentAnnoInfo, isEdit} = this.props.store.getState()
        // get current task
        let task = taskInfo[currentTaskIndex]

        // update task status
        if(isEdit === false) {
            task.isVerified = true
        } else {
            // reproduce annotations from currentAnnoInfo
            let annos = {}
            currentAnnoInfo.forEach((type)=>{
                let boxes = []
                type.children.forEach((item)=>{
                    boxes.push(item.bbox)
                })
                annos[type.key] = boxes
            })
            task.isVerified = false
            task.annotations = annos
        }

        //submit task
        const { token } = this.props.store.getState()
        fetch("http://127.0.0.1:5000/submit_task",{
            method:'post',
            headers:{
              Token: token,
            },
            body: JSON.stringify(task)
        })
        .then(res => {
            if(res.status === 200 ) {
                message.success("Submit success")
            } else {
                message.error("Unknown error, submit failed")
                console.log("Submit response: ", res)
            }
        })
        // remove the task that submitted
        const submittedKey = task.task_id
        const newTaskInfo = taskInfo.filter(task => task.task_id !== submittedKey)
        if(currentTaskIndex !== 0 && currentTaskIndex >= newTaskInfo.length) {
            currentTaskIndex = newTaskInfo.length - 1
        }
        this.props.store.setState({
            taskInfo: [...newTaskInfo],
            currentAnnoInfo: [],
            currentTaskIndex: currentTaskIndex
        })
    }

    getTasks=()=>{
        // get tasks only when all tasks are done.
        if(!this.props.store.getState().taskInfo.length){
            this.showContinueModal()
        } else {
            message.warn("Please complete the assigned tasks first.")
        }
    }
    getRelativePointerPosition (node) {
        // the function will return pointer position relative to the passed node
        const transform = node.getAbsoluteTransform().copy();
        // to detect relative position we need to invert transform
        transform.invert();

        // get pointer (say mouse or touch) position
        const pos = node.getStage().getPointerPosition();
        // now we find relative point
        return transform.point(pos);
    }
    onMouseDown = (e) =>{
        const {editingAnnoKey, currentAnnoInfo}=this.props.store.getState()
        if(editingAnnoKey !== ''){
            //editingAnnoKey is not empty, start painting
            this.setState({
                isPainting: true
            })
            const point = this.getRelativePointerPosition(e.target.getStage());
            console.log("Mouse Down Position: ", point)
            // update the top left point of the editing annotation
            currentAnnoInfo.forEach((type)=>{
                type.children.forEach((item)=>{
                    if(item.key === editingAnnoKey){
                        item.bbox[0] = point.x * scale
                        item.bbox[1] = point.y * scale
                    }
                })
            })
            this.props.store.setState({
                currentAnnoInfo: [...currentAnnoInfo],
            })
        } else {
            // when editingAnnoKey is empty, clear selectedKey
            this.props.store.setState({
                selectedKey: ''
            })
        }
    }
    onMouseMove=(e)=>{
        if(!this.state.isPainting){
            return
        }
        const {editingAnnoKey, currentAnnoInfo}=this.props.store.getState()
        const point = this.getRelativePointerPosition(e.target.getStage());
        console.log("Mouse Move Position: ", point)
        // update the bottom right point of the editing annotation
        currentAnnoInfo.forEach((type)=>{
            type.children.forEach((item)=>{
                if(item.key===editingAnnoKey){
                    item.bbox[2]=point.x*scale
                    item.bbox[3]=point.y*scale
                }
            })
        })
        this.props.store.setState({
            currentAnnoInfo: [...currentAnnoInfo],
        })
    }
    onMouseUp=(e)=>{
        // painting end, clear editingAnnoKey
        this.setState({
            isPainting: false
        })
        this.props.store.setState({
            editingAnnoKey: ''
        })
    }

    showContinueModal = () => {
        this.setState({
            isContinueModalVisible: true
        })
    }

    //TODO 设置申请的task类别
    handleOk_ContinueTasks = () => {
        const { store } = this.props;
        const { token } = store.getState()
        fetch("http://127.0.0.1:5000/tasks",{
                method:'get',
                headers:{
                    Token: token,
                }
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const taskData = data.data
                store.setState({
                    taskInfo: taskData
                });

                if(taskData.length === 0) {
                    message.info("There are no tasks to be assigned.")
                } else {
                    message.success("Get Tasks success, count is " + taskData.length + ".")
                    store.setState({
                        taskType: taskData[0].task_type
                    });
                }
            })

        this.setState({
            isContinueModalVisible: false
        })
    }

    handleCancel_ContinueTasks = () => {
        this.setState({
            isContinueModalVisible: false
        })
    }

    handleChange_TaskOption = (e) => {
        this.setState({
            taskOptionValue: e.target.value
        })
    }

    componentDidMount() {
        // subscribe() function, will execute as soon as the store changes
        this.props.store.subscribe(() => {
            const {taskInfo, currentTaskIndex} = this.props.store.getState()
            if(taskInfo.length){
                let task = taskInfo[currentTaskIndex]
                let filename = task['fig_name']
                let pid = filename.split('_')[0]
                const url = "http://127.0.0.1:5000/img_src/" + pid + '/' + filename

                this.setState({
                    imgURL: url,
                    isTaskEmpty: false
                })
            } else {
                this.setState({
                    imgURL: "",
                    isTaskEmpty: true
                })
            }
        })

        this.props.store.setState({
            currentTaskIndex: 0,
            currentImgURL: this.state.imgURL
        })

        console.log(this.myImgContainer)
     }

    render() {
        return  (
            <div className="imageview">
                ImageView
                <Modal title="Continue to receive tasks?"
                       visible={this.state.isContinueModalVisible}
                       onOk={this.handleOk_ContinueTasks}
                       onCancel={this.handleCancel_ContinueTasks} >
                    <p>Select Task Type</p>
                    <Radio.Group
                        options={taskOptions}
                        onChange={this.handleChange_TaskOption}
                        value={this.state.taskOptionValue}
                        optionType="button"
                        buttonStyle="solid"
                    />
                </Modal>
                <div ref={this.myImgContainer} className="img-content">
                    <Stage
                        ref={this.stageRef}
                        width={this.myImgContainer.current ? this.myImgContainer.current.clientWidth : window.innerWidth}
                        height={this.myImgContainer.current ? this.myImgContainer.current.clientHeight : window.innerHeight}
                        onMouseDown={(e)=>{this.onMouseDown(e)}}
                        onMouseMove={(e)=>{this.onMouseMove(e)}}
                        onMouseUp={(e)=>{this.onMouseUp(e)}}
                        visible = {!this.state.isTaskEmpty}
                        >
                        {/* <BaseImage store={this.props.store}/> */}
                            <AnnosImage
                                image={this.state.imgURL}
                                store={this.props.store}
                                maxW={this.myImgContainer.current ? this.myImgContainer.current.clientWidth : window.innerWidth}
                                maxH={this.myImgContainer.current ? this.myImgContainer.current.clientHeight : window.innerHeight}
                            />
                    </Stage>
                    <div style={{display:this.state.isTaskEmpty ? '' : 'none'}}>
                    <Result
                        icon = {<SmileOutlined/>}
                        title = {TASKALLDONE}
                    />
                    </div>
                </div>
                <footer>
                    <div className="btns">
                    <Button className="btn" type='primary' onClick={this.prevTask}>
                        Prev
                    </Button>
                    <Button className="btn" type='primary' onClick={this.submitAnnos}>
                       Submit
                    </Button>
                    <Button className="btn" type='primary' onClick={this.getTasks}>
                       Get New Tasks
                    </Button>
                    <Button className="btn" type='primary' onClick={this.nextTask}>
                       Next
                    </Button>
                    </div>
                </footer>
            </div>
        )
    }
}
export default ImageView;