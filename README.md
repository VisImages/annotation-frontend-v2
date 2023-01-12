# annotation-frontend-V3文档

# 项目概览

## 项目结构：

> 仅列出主要组件
> 

src
|—components
&emsp;|—ImageView.js （ImageView组件，用于图片展示和打框）
&emsp;|—ListView.js（ListView组件，用于控制标注的增删改）
&emsp;|—MyView.js（主界面）
&emsp;|—TaskView.js（TaskView组件，用于任务信息展示）
&emsp;|—Rects.js（Rect组件，执行标注框的绘制）
|—router（路由）
|—login.js（登录界面）

## 项目逻辑

用户点击登录（/usr/${usrname}）后，平台跳转到主界面，并向后端请求先前分配给当前用户的任务（/previous_tasks），若当前没有已分配的任务，用户可以点击“Get New Tasks”按钮获取新任务（/get_tasks）。每完成一个任务后，用户应点击“Submit”按钮提交任务（/submit_task）。

## 任务类型：

1. TASK_VERIFY_IMAGE
2. TASK_VERIFY_VISUALIZATION
3. TASK_FIND_OTHER_VISUALIZATION

## 全局状态（store）：

username：string，用户名

token：string，用户token

taskInfo：[]，从后端获取的任务列表

taskType：string，任务类型

annType：string，任务为TASK_VERIFY_VISUALIZATION时才使用，表明当前验证标注的可视化图表类别

currentTaskIndex：int，当前任务在任务列表中的索引

currentImgURL：string，当前图片URL

currentAnnoInfo：当前任务的标注信息，格式如下

```jsx
[
    {
        title: ReactNode, //一级标题，组件
        key: string, //标注类别
        children: [
            {
                title: ReactNode, //二级标题，组件
                key: string, //标注框的唯一标识
                bbox: Array(4) //标注框坐标
            }
        ]
    }
]
```

currentAddAnnoInfo：当前任务添加的标注信息，格式与currentAnnoInfo一致

pageNum：int，任务为TASK_VERIFY_IMAGE时才使用，表明当前任务处理的论文页数

isEdit：boolean，指明用户是否对当前任务的标注进行修改

editingAnnoKey：string，用户当前正在编辑的标注Key，通过点击Tree组件节点的编辑按钮启用

selectedKey：string，用户当前选中的标注Key，用于高亮标注框和Tree组件节点

# Login组件

> 执行用户登录逻辑，登录成功后跳转至主界面
> 

# ImageView组件

> 用于图片展示和打框
> 

## state：

imgURL：string，图片URL

isPainting: boolean，是否正在绘制

isContinueModalVisible：boolean，控制继续任务弹窗是否可见

isTaskEmpty: boolean，任务是否为空

imageViewClassName: string，指明imageview的css样式类名

## 关键函数逻辑

### onMouseDown()：

1. 若当前editingAnnoKey不为空，更新state中的isPainting为true，表明开始绘制标注框
2. 获取鼠标点击的坐标并更新到currentAnnoInfo中，若任务类型为TASK_FIND_OTHER_VISUALIZATION，还需更新currentAddAnnoInfo

### onMouseMove()：

1. 若当前isPainting为false，直接返回
2. 若当前isPainting为true，表明绘制开始
3. 获取鼠标点击的坐标并更新到currentAnnoInfo中，若任务类型为TASK_FIND_OTHER_VISUALIZATION，还需更新currentAddAnnoInfo

### onMouseUp()：

1. 鼠标抬起，表明绘制结束，置isPainting为false，editingAnnoKey为空

### submitAnnos()：

1. 根据不同的任务类型和用户操作，生成提交的标注信息
2. 调用/submit_task接口，提交任务
3. 从当前的任务列表（taskInfo）中删除当前提交的任务
4. 更新下一个任务的状态信息，若任务列表为空，则置平台状态信息为空
- task相关字段含义如下：
    - task.is_verify：boolean
        - 当前任务的用户操作是否为验证
    - task.verified_by：string
        - 验证用户名，若当前用户对标注进行了修改（增删改），该字段为null
    - task.modified_by：string
        - 修改用户名，若当前用户对标注进行验证（即未修改），该字段为null
    - task.annotations：[]或{}
        - 若当前用户未修改标注内容，annotations不进行改动
        - 若当前用户修改了标注内容，从currentAnnoInfo中生成对应任务的标注信息annotations
    - task.add_annotations：{}
        - 添加的标注信息
        - 当且仅当任务类型为TASK_FIND_OTHER_VISUALIZATION时，才传递该字段到后端，内容为新添加的可视化标注

### handleOk_ContinueTasks()：

1. 调用/get_tasks接口，从后端获取新任务
2. 若后端返回数据为空，弹出对应提示
3. 若后端返回数据不为空，更新相关的状态信息

### componentDidMount()：

1. 监听全局store的状态信息，一旦store发生改变，更新ImageView组件的state

# ListView组件

> 用于控制标注的增删改
> 

## state：

annoTreeData：[]，Tree组件的数据来源，与currentAnnoInfo保持一致，格式如下

```jsx
[
    {
        title: ReactNode, //一级标题，组件
        key: string, //标注类别
        children: [
            {
                title: ReactNode, //二级标题，组件
                key: string, //标注框的唯一标识
                bbox: Array(4) //标注框坐标
            }
        ]
    }
]
```

isAddTypeModalVisible：boolean，添加任务的弹窗是否可见

newType：string，新添加的可视化图表类别

selectedKey：string，

addTypeDisable：boolean，

addAnnoTreeData：[]，用户添加的标注数据，与currentAddAnnoInfo保持一致，格式与annoTreeData相同

listViewClassName：string，指明listview的css样式类名

## 关键函数逻辑

### createTreeData(annotations)

1. 根据任务类型生成treeData
2. 更新annoTreeData和currentAnnoInfo

### handleOk_AddType()

1. 当且仅当任务类型为TASK_FIND_OTHER_VISUALIZATION，该函数可以被调用
2. 添加新的可视化图表类别到annoTreeData和addAnnoTreeData

### onAdd(key)

1. key用于标识当前添加标注框的类别
2. 根据任务类别和当前对应key的标注数量，更新annoTreeData、addAnnoTreeData、currentAnnoInfo和currentAddAnnoInfo，置isEdit为true

### onEdit(key)

1. key用于标识当前编辑的标注框
2. 更新currentAnnoInfo、currentAddAnnoInfo，更新editingAnnoKey的值为key，置isEdit为true，

### onDelete(key)

1. key用于标识当前要删除的标注框
2. 删除对应的标注框，若对应类别的标注列表为空，删除对应类别，更新annoTreeData、addAnnoTreeData、currentAnnoInfo、currentAddAnnoInfo，置isEdit为true

### handleSelectNode(e)

1. 更新selectedKey为当前Tree组件选中的节点key

### componentDidMount()

1. 监听全局store的状态信息，一旦store发生改变，更新ListView组件的state
2. 若当前的currentAnnoInfo不为空或isEdit为true，用currentAnnoInfo更新annoTreeData，currentAddAnnoInfo更新addAnnoTreeData
3. 反之，调用createTreeData()生成Tree组件的数据

# TaskView组件

> 用于任务信息展示
> 

## state

taskType：string，任务类型

annType：string，任务为TASK_VERIFY_VISUALIZATION时才使用，表明当前验证标注的可视化图表类别

## 关键函数逻辑

### componentDidMount()

1. 监听全局store的状态信息，一旦store发生改变，更新TaskView组件的state

# Rects组件

> 执行标注框的绘制，标注框的颜色默认为红色，选中时为蓝色
> 

## state

rects：[]，标注框列表，格式如下：

```jsx
[
    {
        type: string, //标注框的类别
        key: string, //标注框的唯一标识
        bbox: Array(4), //标注框的坐标
        isSelected: boolean //表示当前框是否选中，用于控制框绘制时的颜色
    }
]
```

scale：int，尺寸，用于控制rect的大小

## 关键函数逻辑

### handleClickRect(e)

1. 设置用户当前点击的rect的isSelected为true，更新selectedKey

### componentDidMount()

1. 监听全局store的状态信息，一旦store发生改变，更新Rects组件的state，即从currentAnnoInfo生成需要绘制的rects