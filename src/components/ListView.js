import React  from "react";
import './ListView.css';

import {Tree} from 'antd';

class ListView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            imgList: ''
        }
    }

    createTreeData(imgInfo){
        let treeData = []
        Object.keys(imgInfo).forEach(item=>{
            let chartType = item
            let boxes = []
            console.log(item, imgInfo[item])
            imgInfo[chartType].forEach((box, index)=>{
                boxes.push({
                    title:'box-'+index,
                    key: chartType+'-'+index
                })
            })
            treeData.push({
                title: chartType,
                key: chartType,
                children: boxes
            })
        })

        this.setState({
            imgList: treeData
        })
    }

    componentDidMount() {
        this.props.store.subscribe(() => {
        const {imgInfo, currentImgIndex} = this.props.store.getState()
        if(imgInfo.length){
        //     let img = imgInfo[0]
        //     let filename = img['fig_name']
        //     let pid = filename.split('_')[0]
            this.createTreeData(imgInfo[currentImgIndex].annotations)
            
        }
        })
    }


    render() {
        return  (
            <div className="listview">
                ListView
                <Tree
                    // checkable
                    // defaultExpandedKeys={['0-0-0', '0-0-1']}
                    // defaultSelectedKeys={['0-0-0', '0-0-1']}
                    // defaultCheckedKeys={['0-0-0', '0-0-1']}
                    // onSelect={onSelect}
                    // onCheck={onCheck}
                    treeData={this.state.imgList}
                    />
            </div>
        )
    }
}
export default ListView;