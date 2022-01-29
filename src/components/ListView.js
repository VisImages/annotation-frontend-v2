import React  from "react";
import './ListView.css';

import {Tree} from 'antd';
import { TreeNode } from "antd/lib/tree-select";
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
            imgList: []
        }
        const {imgInfo, currentImgIndex} = this.props.store.getState()
        if(imgInfo.length){
            this.createTreeData(imgInfo[currentImgIndex].annotations)
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
                            <EditOutlined style={{marginLeft: 10}} />
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

    onSelect = (keys, info) => {
        console.log('Trigger Select', keys, info);
    };

    renderTreeNodes=(data)=>{
        let nodeArr = data.map((item)=>{
            if(item.key.indexOf('-')>0){
                item.title = (
                    <div>
                        <span>{item.key}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} />
                            <MinusOutlined style={{marginLeft: 10}} />
                        </span>
                    </div>
                )
            }else{
                item.title = (
                    <div>
                        <span>{item.key}</span>
                        <span><PlusOutlined style={{marginLeft: 10}} onClick={()=>this.onAdd(item.key)} /></span>
                        
                    </div>
                )
            }
            
            
            if(item.children){
                return (
                    <TreeNode title={item.title}
                        key={item.key}
                        dataRef={item}>
                            {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return <TreeNode title={item.title} key={item.key}></TreeNode>
        })
        return nodeArr
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
                            <EditOutlined style={{marginLeft: 10}} />
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
            currentImgInfo: data
        })
        console.log(this.state.imgList)
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
            currentImgInfo: data
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