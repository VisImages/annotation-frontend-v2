import React from "react";
import { Group, Rect, Text } from "react-konva";

class Rects extends React.Component {
    constructor(props){
        super(props)
        this.state={
            rects:[],
            scale: props.scale
        }
    }

    componentDidMount(){
        this.props.store.subscribe(() => {
            let {currentAnnoInfo, selectedKey} = this.props.store.getState()
            let rects = []
            // produce rects from currentAnnoInfo
            currentAnnoInfo.forEach(type=>{
                type.children.forEach((box)=>{
                    rects.push({
                        type: type.key,
                        key: box.key,
                        bbox: box.bbox,
                        isSelected: box.key === selectedKey
                    })
                })
            })

            this.setState ({
                rects: rects
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            scale: nextProps.scale
        });
    }

    handleClickRect = (e) => {
        const key = e.target.id();
        const rects = this.state.rects;
        // set the selected rect.isSelected = true
        this.setState({
            rects: rects.map((rect) => {
                return {
                    ...rect,
                    isSelected: rect.key === key
                }
            })
        })
        this.props.store.setState({
            selectedKey: key
        })
    }
    render(){
        const {scale} = this.state
        return (
            <Group>
                {
                    this.state.rects.map(rect=>{
                        return (
                            <Group key={rect.key} draggable={false}>
                                <Rect
                                    x={rect.bbox[0]/scale}
                                    y={rect.bbox[1]/scale}
                                    width={(rect.bbox[2]-rect.bbox[0])/scale}
                                    height={(rect.bbox[3]-rect.bbox[1])/scale}
                                    stroke= {rect.isSelected === false ? 'red' : 'blue'}
                                    // draggable={true}
                                    onClick={this.handleClickRect}
                                    id={rect.key}
                                    key={rect.key+'_rect'}/>
                                <Text
                                    x={rect.bbox[0]/scale}
                                    y={rect.bbox[1]/scale}
                                    fill={"#555555"}
                                    text={rect.key} fontSize={15}
                                    key={rect.key+'_text1'} />
                                <Text
                                    x={rect.bbox[2]/scale}
                                    y={rect.bbox[3]/scale-15}
                                    text={rect.key} fontSize={15}
                                    fill={"#555555"}
                                    key={rect.key+'_text2'} />
                            </Group>
                        )
                    })
                }
            </Group>
        )
    }


}

export default Rects;