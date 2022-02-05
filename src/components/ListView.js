import React  from "react";
import './ListView.css';

import {Button, Tree, Modal, Input} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined
} from '@ant-design/icons'
// import { Collapse } from 'antd';

// const { Panel } = Collapse;

class ListView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            imgList: [],
            isModalVisible: false,
            newType: ''
        }
    }

    createTreeData(imgInfo){
        const {currentImgInfo} = this.props.store.getState()
        if(currentImgInfo.length){
            this.setState({
                imgList: currentImgInfo
            })
            return
        }
        let treeData = []
        Object.keys(imgInfo).forEach(item=>{
            let chartType = item
            let boxes = []
            // console.log(item, imgInfo[item])

            imgInfo[chartType].forEach((box, index)=>{
                let title1 = (
                    <div>
                        <span>{'box-'+index}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(chartType+'-'+index)}/>
                            <MinusOutlined style={{marginLeft: 10}} onClick={()=>this.onDelete(chartType+'-'+index)}/>
                        </span>
                    </div>
                )
                boxes.push({
                    // title:'box-'+index,
                    title:title1,
                    key: chartType+'-'+index,
                    bbox: box
                })
            })

             
            let title2 = (
                <div>
                    <span>{chartType}</span>
                    <span><PlusOutlined style={{marginLeft: 10}} onClick={()=>this.onAdd(chartType)} /></span>
                    
                </div>
            )
            treeData.push({
                title: title2,
                key: chartType,
                children: boxes
            })
        })

        this.setState({
            imgList: treeData
        })
    }

    showModal = () => {
        this.setState({
            isModalVisible: true
        })
    }

    onInputChange=(e)=>{
        this.setState({
            newType: e.target.value
        })
        console.log(this.state.newType)
    }

    handleOk = () => {
        let data = this.state.imgList
        let chartType = this.state.newType
        let boxes = []
        let title1 = (
            <div>
                <span>{'box-0'}</span>
                <span>
                    <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(chartType+'-0')}/>
                    <MinusOutlined style={{marginLeft: 10}} onClick={()=>this.onDelete(chartType+'-0')}/>
                </span>
            </div>
        )
        boxes.push({
            // title:'box-'+index,
            title:title1,
            key: chartType+'-0',
            bbox: [0,10,0,10]
        })
     
        let title2 = (
            <div>
                <span>{chartType}</span>
                <span><PlusOutlined style={{marginLeft: 10}} onClick={()=>this.onAdd(chartType)} /></span>
                
            </div>
        )
        data.push({
            title: title2,
            key: chartType,
            children: boxes
        })
        this.setState({
            newType: ''
        })
        console.log(this.state.newType)
        this.setState({
            isModalVisible: false
        })
    }

    handleCancel = () => {
        this.setState({
            newType: ''
        })
        console.log(this.state.newType)
        this.setState({
            isModalVisible: false
        })
    }

    onAdd = (key) => {
        // addNode(key)
        console.log(key)
        let data = this.state.imgList
        data.forEach((item)=>{
            console.log(item)
            if(item.key===key){
                let myKey = item.key+'-'+item.children.length
                let title = (
                    <div>
                        <span>{'box-'+item.children.length}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(myKey)}/>
                            <MinusOutlined style={{marginLeft: 10}}  onClick={()=>this.onDelete(myKey)}/>
                        </span>
                    </div>
                )
                item.children.push({
                    // title:'box-'+item.children.length,
                    title:title,
                    key:item.key+'-'+item.children.length,
                    bbox:[]
                })
            }
        })
        this.setState({
            imgList: data
        })
        this.props.store.setState({
            currentImgInfo: data,
            isEdit: true
        })
        console.log(this.state.imgList)
    }

    onEdit = (key) =>{
        this.props.store.setState({
            currentImgInfo: this.state.imgList,
            editKey: key,
            isEdit: true,
        })
    }

    onDelete=(key)=>{
        let data = this.state.imgList
        data.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                console.log(key)
                if(item.key===key){
                    type.children.splice(index,1)
                    if(type.children.length===0){
                        data.splice(idx,1)
                    }
                }
            })
        }) 
        this.setState({
            imgList: data
        })
        this.props.store.setState({
            currentImgInfo: data,
            isEdit: true
        })
        console.log(this.state.imgList)
    }

    componentDidMount() {
        this.props.store.subscribe(() => {
            const {imgInfo, currentImgIndex} = this.props.store.getState()
            if(imgInfo.length){
                this.createTreeData(imgInfo[currentImgIndex].annotations)
            }
        })
    }

    componentDidUpdate(){
    }

    render() {
        return  (
            <div className="listview">
                ListView
                <div>
                <Button type='primary' size='small' onClick={this.showModal}>Add New Type</Button>
                <Modal title="add new type"
                       visible={this.state.isModalVisible}
                       onOk={this.handleOk}
                       onCancel={this.handleCancel} >
                    <Input onChange={(e)=>this.onInputChange(e)}></Input>
                </Modal>
                </div>
                {/* <Tree
                    // checkable
                    defaultExpandedAll={true}
                    // defaultSelectedKeys={['0-0-0', '0-0-1']}
                    // defaultCheckedKeys={['0-0-0', '0-0-1']}
                    onSelect={this.onSelect}
                    // onCheck={onCheck}
                    treeData={this.state.imgList}
                    /> */}
                {/* <Tree>{this.renderTreeNodes(this.state.imgList)}</Tree> */}
                {
                    this.state.imgList.length ? (
                        <Tree treeData={[...this.state.imgList]}>
                        </Tree>
                    ) : (
                       <div> no data</div>
                    )
                }
            </div>
        )
    }
}
export default ListView;