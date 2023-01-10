import React  from "react";
import './ListView.css';
import {TASK_VERIFY_VISUALIZATION, TREE_IMAGE_KEY, VIS_CATEGORIES, TASK_FIND_OTHER_VISUALIZATION, TREE_BUTTON_DISABLE, TREE_BUTTON_ABLE, TASK_VERIFY_IMAGE, LIST_VIEW, LIST_VIEW_PAPER} from '../config'
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
            addAnnoTreeData: [],
            listViewClassName: LIST_VIEW
        }
    }
    createTreeData(annotations){
        // when currentAnnoInfo is empty or isEdit === false（Not yet modified）
        // produce treeData from annotations
        let treeData = []
        const {taskType} = this.props.store.getState()
        let tree_flag = taskType === TASK_FIND_OTHER_VISUALIZATION ? TREE_BUTTON_DISABLE : TREE_BUTTON_ABLE

        if(taskType === TASK_VERIFY_IMAGE) {
            let boxes = []
            annotations.forEach((item, index) => {
                const label = 'box-' + item.page_image_idx
                const imageKey = 'image-' + item.page_image_idx
                const title1 = this.generate_children_title(label, imageKey, tree_flag)
                boxes.push({
                    title: title1,
                    key: imageKey,
                    image_id: item.image_id,
                    page_image_idx: item.page_image_idx,
                    bbox: item.bbox
                })
            })
            const title2 = this.generate_image_title()
            treeData.push({
                title: title2,
                key: TREE_IMAGE_KEY,
                children: boxes
            })
        } else {
            Object.keys(annotations).forEach(item=>{
                const chartType = item
                let boxes = []
                annotations[chartType].forEach((box, index)=>{
                    const label = 'box-'+index
                    const chartKey = chartType+'-'+index
                    const title1 = this.generate_children_title(label, chartKey, tree_flag)
                    boxes.push({
                        title: title1,
                        key: chartKey,
                        bbox: box
                    })
                })
                const title2 = this.generate_chart_title(chartType, tree_flag)
                treeData.push({
                    title: title2,
                    key: chartType,
                    children: boxes
                })
            })
        }

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

    generate_image_title() {
        return (
            <div>
                <span>images</span>
                <span><PlusOutlined style={{marginLeft: 10}} onClick={()=>this.onAdd(TREE_IMAGE_KEY)} /></span>
            </div>
        )
    }

    generate_children_title(label, key, tree_flag) {
        switch (tree_flag) {
            case TREE_BUTTON_ABLE: {
                return (
                    <div>
                        <span>{label}</span>
                        <span>
                            <EditOutlined style={{marginLeft: 10}} onClick={()=>this.onEdit(key)}/>
                            <MinusOutlined style={{marginLeft: 10}} onClick={()=>this.onDelete(key)}/>
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
        if(key === TREE_IMAGE_KEY) {
            const {pageNum} = this.props.store.getState()
            treeData.forEach((item)=> {
                if(item.key === key) {
                    if(item.children.length === 0) {
                        const image_id = 0
                        const page_image_idx = pageNum + '-' + 0
                        const label = 'box-' + page_image_idx
                        const imageKey = 'image-' + page_image_idx
                        const title = this.generate_children_title(label, imageKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title: title,
                            key: imageKey,
                            image_id: image_id,
                            page_image_idx: page_image_idx,
                            bbox: []
                        })
                    } else {
                        const page_image_idx_suffix = parseInt(item.children[item.children.length-1].page_image_idx.split('-')[1]) + 1
                        const last_image_id = item.children[item.children.length-1].image_id
                        const page_image_idx = pageNum + '-' + page_image_idx_suffix
                        const label = 'box-' + page_image_idx
                        const imageKey = 'image-' + page_image_idx
                        const title = this.generate_children_title(label, imageKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title: title,
                            key: imageKey,
                            image_id: last_image_id + 1,
                            page_image_idx: page_image_idx,
                            bbox: []
                        })
                    }
                }
            })
        } else {
            treeData.forEach((item)=>{
                if(item.key===key){
                    if(item.children.length === 0) {
                        const label = 'box-' + 0
                        const chartKey = item.key + '-' + 0
                        let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title:title,
                            key:chartKey,
                            bbox:[]
                        })
                    } else {
                        const lastKey = item.children[item.children.length-1].key
                        const lastIndex = parseInt(lastKey.split('-')[1])
                        const curIndex = lastIndex+1
                        let label = 'box-' + curIndex
                        let chartKey = item.key+'-'+curIndex
                        let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title:title,
                            key:chartKey,
                            bbox:[]
                        })
                    }
                }
            })

            addTreeData.forEach((item)=>{
                if(item.key===key){
                    if(item.children.length === 0) {
                        const label = 'box-' + 0
                        const chartKey = item.key + '-' + 0
                        let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title:title,
                            key:chartKey,
                            bbox:[]
                        })
                    } else {
                        const lastKey = item.children[item.children.length-1].key
                        const lastIndex = parseInt(lastKey.split('-')[1])
                        const curIndex = lastIndex+1
                        let label = 'box-' + curIndex
                        let chartKey = item.key+'-'+curIndex
                        let title = this.generate_children_title(label, chartKey, TREE_BUTTON_ABLE)
                        item.children.push({
                            title:title,
                            key:chartKey,
                            bbox:[]
                        })
                    }
                }
            })
        }

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

        treeData.forEach((type)=>{
            type.children.forEach((item, index)=>{
                if(item.key===key){
                    // delete tree node by the key
                    type.children.splice(index,1)
                    // when the type is empty, delete the type
                    if(type.children.length===0){
                        treeData = treeData.filter((tt) => {
                            return tt.key !== type.key
                        })
                    }
                }
            })
        })

        addTreeData.forEach((type)=>{
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
                addTypeDisable: (taskType !== TASK_FIND_OTHER_VISUALIZATION) ? true : false,
                listViewClassName: taskType === TASK_VERIFY_IMAGE ? LIST_VIEW_PAPER : LIST_VIEW
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
            <div className={this.state.listViewClassName}>
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