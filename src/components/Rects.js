import React from "react";
import { Group, Layer, Rect, Text } from "react-konva";

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
            let {imgInfo, currentImgIndex, currentImgInfo} = this.props.store.getState()
            // console.log(annos)
            let rects = []
            if(currentImgInfo.length){
                console.log(currentImgInfo)
                let annos = currentImgInfo
                annos.forEach(type=>{
                    type.children.forEach((box)=>{
                        rects.push({
                            type: type.key,
                            key: box.key,
                            bbox: box.bbox
                        })
                    })
                })
            }else if(imgInfo.length){
                // console.log(imgInfo,currentImgIndex)
                let annos = imgInfo[currentImgIndex].annotations
                Object.keys(annos).forEach(type=>{
                    annos[type].forEach((box, index)=>{
                        rects.push({
                            type: type,
                            key: type+'-'+index,
                            bbox: box
                        })
                    })
                })
            }
            this.setState ({
                rects: rects
            })
            console.log(this.props.scale)
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            scale: nextProps.scale
        });
    }
    
    render(){
        const {scale} = this.state
        return (
            <Group>
                {this.state.rects.map(rect=>{
                    return (
                        <Group key={rect.key} draggable={true}>
                            <Rect 
                                x={rect.bbox[0]/scale}
                                y={rect.bbox[1]/scale}
                                width={(rect.bbox[2]-rect.bbox[0])/scale} 
                                height={(rect.bbox[3]-rect.bbox[1])/scale} 
                                stroke= {'red'}
                                // draggable={true}
                                key={rect.key+'_rect'}/>
                            <Text x={rect.bbox[0]/scale}
                                y={rect.bbox[1]/scale}
                                text={rect.key} fontSize={15}
                                key={rect.key+'_text'} />
                        </Group>
                        
                    )
                })

                }
            </Group>
        ) 
    }


}

export default Rects;