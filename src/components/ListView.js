import React  from "react";
import './ListView.css';

import {Button, Tree, Modal, Select} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined
} from '@ant-design/icons'

const VISCATEGORIES = [{"value": "flow_diagram", "label": "flow_diagram"}, {"value": "scatterplot", "label": "scatterplot"}, {"value": "bar_chart", "label": "bar_chart"}, {"value": "graph", "label": "graph"}, {"value": "treemap", "label": "treemap"}, {"value": "table", "label": "table"}, {"value": "line_chart", "label": "line_chart"}, {"value": "tree", "label": "tree"}, {"value": "small_multiple", "label": "small_multiple"}, {"value": "heatmap", "label": "heatmap"}, {"value": "matrix", "label": "matrix"}, {"value": "map", "label": "map"}, {"value": "pie_chart", "label": "pie_chart"}, {"value": "sankey_diagram", "label": "sankey_diagram"}, {"value": "area_chart", "label": "area_chart"}, {"value": "proportional_area_chart", "label": "proportional_area_chart"}, {"value": "glyph_based", "label": "glyph_based"}, {"value": "stripe_graph", "label": "stripe_graph"}, {"value": "parallel_coordinate", "label": "parallel_coordinate"}, {"value": "sunburst_icicle", "label": "sunburst_icicle"}, {"value": "unit_visualization", "label": "unit_visualization"}, {"value": "polar_plot", "label": "polar_plot"}, {"value": "error_bar", "label": "error_bar"}, {"value": "box_plot", "label": "box_plot"}, {"value": "sector_chart", "label": "sector_chart"}, {"value": "word_cloud", "label": "word_cloud"}, {"value": "donut_chart", "label": "donut_chart"}, {"value": "hierarchical_edge_bundling", "label": "hierarchical_edge_bundling"}, {"value": "chord_diagram", "label": "chord_diagram"}, {"value": "storyline", "label": "storyline"}]

class ListView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            imgList: [],
            isAddTypeModalVisible: false,
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

    showAddTypeModal = () => {
        this.setState({
            isAddTypeModalVisible: true
        })
    }

    onVisTypeChange=(e)=>{
        this.setState({
            newType: e
        })
    }

    handleOk_AddType = () => {
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
            isAddTypeModalVisible: false
        })
    }

    handleCancel_AddType = () => {
        this.setState({
            newType: ''
        })
        console.log(this.state.newType)
        this.setState({
            isAddTypeModalVisible: false
        })
    }

    onAdd = (key) => {
        // addNode(key)
        console.log(key)
        let data = this.state.imgList
        data.forEach((item)=>{
            console.log(item)
            if(item.key===key){
                const lastKey = item.children[item.children.length-1].key
                const lastIndex = parseInt(lastKey.split('-')[1])
                const myIndex = lastIndex+1
                let myKey = item.key+'-'+myIndex
                let title = (
                    <div>
                        <span>{'box-'+myIndex}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(myKey)}/>
                            <MinusOutlined style={{marginLeft: 10}}  onClick={()=>this.onDelete(myKey)}/>
                        </span>
                    </div>
                )
                item.children.push({
                    // title:'box-'+item.children.length,
                    title:title,
                    key:myKey,
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
    // set currentImgInfo: which is visualization annotations in VerifyImages Tasks, need to improve the name
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
                <Button type='primary' size='small' onClick={this.showAddTypeModal}>Add New Type</Button>
                <Modal title="add new type"
                       visible={this.state.isAddTypeModalVisible}
                       onOk={this.handleOk_AddType}
                       onCancel={this.handleCancel_AddType} >
                    {/* <Input onChange={(e)=>this.onInputChange(e)}></Input> */}
                    <Select
                        showSearch
                        style={{ width: 250 }}
                        placeholder="Select a visualization type"
                        optionFilterProp="children"
                        onChange={this.onVisTypeChange}
                        // onSearch={this.onVisTypeSearch}
                        filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options= {VISCATEGORIES}
                    />
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