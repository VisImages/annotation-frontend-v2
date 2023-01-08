import React  from "react";
import {Button, Modal, Result, message} from 'antd';
import {TASK_VERIFY_VISUALIZATION, TASK_ALLDONE_MESSAGE, TASK_FIND_OTHER_VISUALIZATION} from '../config'
import './ImageView.css';
import { Image, Layer, Stage } from "react-konva";
import Rects from "./Rects";
import useImage from 'use-image';
import { SmileOutlined } from "@ant-design/icons";

let scale;

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
            isTaskEmpty: true
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
            const taskType = taskInfo[currentTaskIndex-1].task_type.startsWith(TASK_VERIFY_VISUALIZATION) ? TASK_VERIFY_VISUALIZATION : taskInfo[currentTaskIndex-1].task_type
            this.props.store.setState({
                currentTaskIndex: currentTaskIndex-1,
                currentImgURL: url,
                currentAnnoInfo: [],
                currentAddAnnoInfo: [],
                taskType: taskType,
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
            const taskType = taskInfo[currentTaskIndex+1].task_type.startsWith(TASK_VERIFY_VISUALIZATION) ? TASK_VERIFY_VISUALIZATION : taskInfo[currentTaskIndex+1].task_type
            this.props.store.setState({
                currentTaskIndex: currentTaskIndex+1,
                currentImgURL: url,
                currentAnnoInfo: [],
                currentAddAnnoInfo: [],
                taskType: taskType,
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
        const {taskInfo, currentTaskIndex, currentAnnoInfo, currentAddAnnoInfo, isEdit, username, taskType} = this.props.store.getState()
        // get current task
        let task = taskInfo[currentTaskIndex]

        // update task status
        if(isEdit === false) {
            task.is_verify = true
            task.verified_by = username
            task.modified_by = null
            if(taskType === TASK_FIND_OTHER_VISUALIZATION) {
                task.add_annotations = {}
            }
        } else {
            // reproduce annotations from currentAnnoInfo
            if(taskType === TASK_VERIFY_VISUALIZATION) {
                let annos = {}
                currentAnnoInfo.forEach((type)=>{
                    let boxes = []
                    type.children.forEach((item)=>{
                        boxes.push(item.bbox)
                    })
                    annos[type.key] = boxes
                })
                task.annotations = annos
            } else if(taskType === TASK_FIND_OTHER_VISUALIZATION) {
                let annos = {}
                currentAddAnnoInfo.forEach((type)=>{
                    let boxes = []
                    type.children.forEach((item)=>{
                        boxes.push(item.bbox)
                    })
                    annos[type.key] = boxes
                })
                task.add_annotations = annos
            } else {
                console.error('Unknown Task Type')
            }

            task.is_verify = false
            task.modified_by = username
            task.verified_by = null

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
            this.props.store.setState({
                currentTaskIndex: newTaskInfo.length - 1,
                taskInfo: [...newTaskInfo],
                currentAnnoInfo: [],
                currentAddAnnoInfo: [],
                isEdit: false
            })
        } else {
            this.props.store.setState({
                taskInfo: [...newTaskInfo],
                currentAnnoInfo: [],
                currentAddAnnoInfo: [],
                isEdit: false
            })
        }
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
        const {editingAnnoKey, currentAnnoInfo, currentAddAnnoInfo, taskType} =this.props.store.getState()
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

            if(taskType === TASK_FIND_OTHER_VISUALIZATION) {
                currentAddAnnoInfo.forEach((type)=>{
                    type.children.forEach((item)=>{
                        if(item.key === editingAnnoKey){
                            item.bbox[0] = point.x * scale
                            item.bbox[1] = point.y * scale
                        }
                    })
                })
            }

            this.props.store.setState({
                currentAnnoInfo: [...currentAnnoInfo],
                currentAddAnnoInfo: [...currentAddAnnoInfo]
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
        const {editingAnnoKey, currentAnnoInfo, currentAddAnnoInfo, taskType}=this.props.store.getState()
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

        if(taskType === TASK_FIND_OTHER_VISUALIZATION) {
            currentAddAnnoInfo.forEach((type)=>{
                type.children.forEach((item)=>{
                    if(item.key === editingAnnoKey){
                        item.bbox[2]=point.x*scale
                        item.bbox[3]=point.y*scale
                    }
                })
            })
        }

        this.props.store.setState({
            currentAnnoInfo: [...currentAnnoInfo],
            currentAddAnnoInfo: [...currentAddAnnoInfo]
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

    handleOk_ContinueTasks = () => {
        const { store } = this.props;
        const { token } = store.getState()
        fetch("http://127.0.0.1:5000/get_tasks",{
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

                if(taskData.length === 0) {
                    message.info("There are no tasks to be assigned.")
                    store.setState({
                        taskInfo: taskData,
                        taskType: ''
                    });
                } else {
                    const taskType = taskData[0].task_type.startsWith(TASK_VERIFY_VISUALIZATION) ? TASK_VERIFY_VISUALIZATION : taskData[0].task_type
                    message.success("Get Tasks success, count is " + taskData.length + ".")
                    store.setState({
                        taskInfo: taskData,
                        taskType: taskType
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
                        title = {TASK_ALLDONE_MESSAGE}
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