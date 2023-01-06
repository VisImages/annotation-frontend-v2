import React  from "react";
import './ListView.css';

import {Button, Tree, Modal, Select, message, Tag} from 'antd';
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
            annoTreeData: [],
            isAddTypeModalVisible: false,
            newType: '',
            selectedKey: '' // selectedKey for tree node
        }
    }

    createTreeData(annotations){
        // when currentAnnoInfo is empty or isEdit === false（Not yet modified）
        // produce treeData from annotations
        let treeData = []

        Object.keys(annotations).forEach(item=>{
            let chartType = item
            let boxes = []
            annotations[chartType].forEach((box, index)=>{
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
                    title: title1,
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
            annoTreeData: treeData
        })

        this.props.store.setState({
            currentAnnoInfo: treeData
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
        let data = this.state.annoTreeData
        const keyList = data.map(item => item.key)
        let chartType = this.state.newType
        if(keyList.indexOf(chartType) !== -1) {
            message.error("Added an existing type.")
            return
        } else if(chartType === '' || chartType === undefined || chartType === null) {
            message.error("Added an empty type.")
            return
        }
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

        // add new type node into annoTreeData
        this.setState({
            newType: '',
            isAddTypeModalVisible: false,
            annoTreeData: [
                ...data,
                {
                    title: title2,
                    key: chartType,
                    children: boxes
                }
            ]
        })
    }

    handleCancel_AddType = () => {
        this.setState({
            newType: '',
            isAddTypeModalVisible: false
        })
    }

    onAdd = (key) => {
        let data = this.state.annoTreeData
        data.forEach((item)=>{
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
            annoTreeData: data
        })
        this.props.store.setState({
            currentAnnoInfo: data,
            isEdit: true
        })
    }

    onEdit = (key) =>{
        this.props.store.setState({
            currentAnnoInfo: this.state.annoTreeData,
            editingAnnoKey: key,
            isEdit: true,
        })
    }

    onDelete = (key) => {
        let data = this.state.annoTreeData
        data.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                if(item.key===key){
                    // delete tree node by the key
                    type.children.splice(index,1)
                    // when the type is empty, delete the type
                    if(type.children.length===0){
                        data.splice(idx,1)
                    }
                }
            })
        })
        this.setState({
            annoTreeData: data
        })
        this.props.store.setState({
            currentAnnoInfo: data,
            isEdit: true
        })
    }

    handleSelectNode = (e) => {
        // get the selected node key
        const currKey = e[0]
        this.setState({
            selectedKey: currKey
        })
        this.props.store.setState({
            selectedKey: currKey
        })
    }

    componentDidMount() {
        this.props.store.subscribe(() => {
            const {taskInfo, currentTaskIndex, selectedKey, currentAnnoInfo, isEdit} = this.props.store.getState()
            this.setState({
                selectedKey: selectedKey
            })

            if(currentAnnoInfo.length || isEdit){
                this.setState({
                    annoTreeData: currentAnnoInfo
                })
            } else {
                //execute createTreeData after loading taskInfo
                if(taskInfo.length){
                    this.createTreeData(taskInfo[currentTaskIndex].annotations)
                }
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
                <Tag className="tag" color='blue'> TaskType: {this.props.store.getState().taskType}</Tag>
                <br></br>
                <Button type='primary' size='small' onClick={this.showAddTypeModal}>Add New Type</Button>
                <Modal title="add new type"
                       visible={this.state.isAddTypeModalVisible}
                       onOk={this.handleOk_AddType}
                       onCancel={this.handleCancel_AddType} >
                    <Select
                        showSearch
                        style={{ width: 250 }}
                        placeholder="Select a visualization type"
                        optionFilterProp="children"
                        onChange={this.onVisTypeChange}
                        filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options= {VISCATEGORIES}
                    />
                </Modal>
                </div>
                {
                    this.state.annoTreeData.length ? (
                        <Tree
                            treeData={[...this.state.annoTreeData]}
                            selectedKeys={[this.state.selectedKey]}
                            defaultExpandAll={true}
                            onSelect={this.handleSelectNode}
                        >
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