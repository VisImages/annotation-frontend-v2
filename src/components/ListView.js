import React  from "react";
import './ListView.css';
import {TASK_VERIFY_VISUALIZATION, VIS_CATEGORIES, TASK_FIND_OTHER_VISUALIZATION, TREE_BUTTON_DISABLE, TREE_BUTTON_ABLE, TASK_VERIFY_IMAGE} from '../config'
import {Button, Tree, Modal, Select, message} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    MinusOutlined
} from '@ant-design/icons'

class ListView extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            annoTreeData: [],
            isAddTypeModalVisible: false,
            newType: '',
            selectedKey: '', // selectedKey for tree node
            addTypeDisable: false,
            addAnnoTreeData: []
        }
    }
    // TODO deal with TASK_VERIFY_IMAGE
    createTreeData(annotations){
        // when currentAnnoInfo is empty or isEdit === false（Not yet modified）
        // produce treeData from annotations
        let treeData = []
        const {taskType} = this.props.store.getState()
        let tree_flag = taskType === TASK_FIND_OTHER_VISUALIZATION ? TREE_BUTTON_DISABLE : TREE_BUTTON_ABLE

        Object.keys(annotations).forEach(item=>{
            let chartType = item
            let boxes = []
            annotations[chartType].forEach((box, index)=>{
                let label = 'box-'+index
                let chartKey = chartType+'-'+index
                let title1 = this.generate_children_title(label, chartKey, tree_flag)
                boxes.push({
                    title: title1,
                    key: chartType+'-'+index,
                    bbox: box
                })
            })
            let title2 = this.generate_chart_title(chartType, tree_flag)
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

    generate_chart_title(chartType, tree_flag) {
        switch (tree_flag) {
            case TREE_BUTTON_ABLE: {
                return (
                    <div>
                        <span>{chartType}</span>
                        <span><PlusOutlined style={{marginLeft: 10}} onClick={()=>this.onAdd(chartType)} /></span>
                    </div>
                )
            }
            default: {
                return (
                    <div>
                        <span>{chartType}</span>
                    </div>
                )
            }
        }
    }

    generate_children_title(label, chartKey, tree_flag) {
        switch (tree_flag) {
            case TREE_BUTTON_ABLE: {
                return (
                    <div>
                        <span>{label}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(chartKey)}/>
                            <MinusOutlined style={{marginLeft: 10}} onClick={()=>this.onDelete(chartKey)}/>
                        </span>
                    </div>
                )
            }
            default: {
                return (
                    <div>
                        <span>{label}</span>
                    </div>
                )
            }
        }
    }

    handleOk_AddType = () => {
        let treeData = this.state.annoTreeData
        let addTreeData = this.state.addAnnoTreeData
        const keyList = treeData.map(item => item.key)
        let chartType = this.state.newType
        if(keyList.indexOf(chartType) !== -1) {
            message.error("Added an existing type.")
            return
        } else if(chartType === '' || chartType === undefined || chartType === null) {
            message.error("Added an empty type.")
            return
        }
        let boxes = []
        let label = 'box-0'
        let chartKey = chartType+'-0'
        let title1 = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
        boxes.push({
            // title:'box-'+index,
            title:title1,
            key: chartType+'-0',
            bbox: [0,10,0,10]
        })

        let title2 = this.generate_chart_title(chartType, TREE_BUTTON_ABLE)

        treeData.push({
            title: title2,
            key: chartType,
            children: [...boxes]
        })

        addTreeData.push({
            title: title2,
            key: chartType,
            children: [...boxes]
        })

        // add new type node into annoTreeData
        this.setState({
            newType: '',
            isAddTypeModalVisible: false,
            annoTreeData: treeData,
            addAnnoTreeData: addTreeData
        })
    }

    handleCancel_AddType = () => {
        this.setState({
            newType: '',
            isAddTypeModalVisible: false
        })
    }

    onAdd = (key) => {
        let treeData = this.state.annoTreeData
        let addTreeData = this.state.addAnnoTreeData
        treeData.forEach((item)=>{
            if(item.key===key){
                const lastKey = item.children[item.children.length-1].key
                const lastIndex = parseInt(lastKey.split('-')[1])
                const myIndex = lastIndex+1
                let label = 'box-' + myIndex
                let chartKey = item.key+'-'+myIndex
                let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                item.children.push({
                    title:title,
                    key:chartKey,
                    bbox:[]
                })
            }
        })

        addTreeData.forEach((item)=>{
            if(item.key===key){
                const lastKey = item.children[item.children.length-1].key
                const lastIndex = parseInt(lastKey.split('-')[1])
                const myIndex = lastIndex+1
                let label = 'box-' + myIndex
                let chartKey = item.key+'-'+myIndex
                let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                item.children.push({
                    title:title,
                    key:chartKey,
                    bbox:[]
                })
            }
        })

        this.setState({
            annoTreeData: treeData,
            addAnnoTreeData: addTreeData
        })

        this.props.store.setState({
            currentAnnoInfo: treeData,
            currentAddAnnoInfo: addTreeData,
            isEdit: true
        })
    }

    onEdit = (key) =>{
        this.props.store.setState({
            currentAnnoInfo: this.state.annoTreeData,
            currentAddAnnoInfo: this.state.addAnnoTreeData,
            editingAnnoKey: key,
            isEdit: true,
        })
    }

    onDelete = (key) => {
        let treeData = this.state.annoTreeData
        let addTreeData = this.state.addAnnoTreeData
        treeData.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                if(item.key===key){
                    // delete tree node by the key
                    type.children.splice(index,1)
                    // when the type is empty, delete the type
                    if(type.children.length===0){
                        // treeData.splice(idx,1)
                        treeData = treeData.filter((tt) => {
                            return tt.key !== type.key
                        })
                    }
                }
            })
        })
        
        addTreeData.forEach((type,idx)=>{
            type.children.forEach((item, index)=>{
                if(item.key===key){
                    // delete tree node by the key
                    type.children.splice(index,1)
                    // when the type is empty, delete the type
                    if(type.children.length===0){
                        addTreeData = addTreeData.filter((tt) => {
                            return tt.key !== type.key
                        })
                    }
                }
            })
        })

        this.setState({
            annoTreeData: treeData,
            addAnnoTreeData: addTreeData
        })
        this.props.store.setState({
            currentAnnoInfo: treeData,
            currentAddAnnoInfo: addTreeData,
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
            const {taskInfo, currentTaskIndex, selectedKey, currentAnnoInfo, currentAddAnnoInfo, isEdit, taskType} = this.props.store.getState()
            this.setState({
                selectedKey: selectedKey,
                addTypeDisable: (taskType !== TASK_FIND_OTHER_VISUALIZATION) ? true : false
            })

            if(currentAnnoInfo.length || isEdit){
                this.setState({
                    annoTreeData: currentAnnoInfo,
                    addAnnoTreeData: currentAddAnnoInfo
                })
            } else {
                //execute createTreeData after loading taskInfo
                if(taskInfo.length){
                    this.createTreeData(taskInfo[currentTaskIndex].annotations)
                }
            }
        })
    }

    render() {
        return  (
            <div className="listview">
                ListView
                <div>
                <Button type='primary' size='small'
                    onClick={this.showAddTypeModal}
                    disabled={this.state.addTypeDisable}
                >
                    Add New Type
                </Button>
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
                        options= {VIS_CATEGORIES}
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