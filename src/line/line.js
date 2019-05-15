import React from 'react';
import { _isExist, _deepCopy } from '../../utils/validator.js';
import { _getCtx, _drawLine } from '../../utils/canvas.js';
import './line.less';

const obj = _drawLine();
const _drawLineCoor = obj._drawLineCoor.bind(obj);
const _drawLineScale = obj._drawLineScale.bind(obj);
const _drawLineGrid = obj._drawLineGrid.bind(obj);
const _drawLineLabel = obj._drawLineLabel.bind(obj);
const _drawLineData = obj._drawLineData.bind(obj);
const _drawLineDataBlock = obj._drawLineDataBlock.bind(obj);

/**
 * 折线图
 */
class Line extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back', 'data', 'block'],
			titleDOM : undefined,
			tooltipPro : {},
			xCoor : {},				//x轴{begin:[x,y], end:[x,y]}
			yCoor : {},				//y轴{begin:[x,y], end:[x,y]}
			props : {},				//外部传入的props
			formatData : [],		//
		}
		this.drawBlock = this.drawBlock.bind(this);
	}

	//格式化上下左右
	getPosition(){
		let { innerGap } = this.state.props;
		return { top : innerGap[0] , right : innerGap[1] , bottom : innerGap[2] , left : innerGap[3] };
	}

	//组件完全受控，将props存入state的props对象中
	componentDidMount(){
		this.setState({ props : this.props , formatData : _deepCopy(this.props.data) }, () => this.init());
	}

	//组件完全受控，将props存入state的props对象中
	componentWillReceiveProps(nextProps){
		this.setState({ props : nextProps , formatData : _deepCopy(nextProps.data) }, () => this.init())
	}

	init(){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		let { top , right , bottom , left } = this.getPosition();
		let ctxBack = _getCtx.call(this, canvasId[0]);
		let ctxData = _getCtx.call(this, canvasId[1]);
		//给block的canvas页面 添加鼠标事件监听
		let block = this.refs[canvasId[2]];
		block.addEventListener('mousemove', this.drawBlock);
		this.setState({
			xCoor : { begin : [left, height - bottom] , end : [width - right, height - bottom] },
			yCoor : { begin : [left, height - bottom] , end : [left, top] }
		}, () => {
			this.drawBack(ctxBack);
			this.drawData(ctxData);
			this.drawTitle();
			this.drawTooltip()
		})
	}

	//绘制背景及坐标系
	drawBack(ctx){
		let { xCoor , yCoor , formatData } = this.state;
		let { width , height , axisX , axisY , scaleX , scaleY , gridX , gridY , labelX , labelY , dataLine } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		//绘制x轴
		_drawLineCoor(ctx, { ...axisX, ...xCoor });
//		//绘制y轴
		_drawLineCoor(ctx, { ...axisY, ...yCoor });
//		//绘制x轴刻度
		_drawLineScale(ctx, { ...axisX, ...xCoor, ...scaleX, scaleNum : formatData.length });
//		//绘制y轴刻度
		_drawLineScale(ctx, { ...axisY, ...yCoor, ...scaleY });
//		//绘制x轴指示线(绘制x轴指示线，指示线数量为data.length,指示线长度这里length不需要取绝对值，内部计算需要带正负来计算)
		_drawLineGrid(ctx, { ...axisX, ...xCoor, ...gridX, gridNum : formatData.length , gridLength : yCoor.end[1]-yCoor.begin[1] });
//		//绘制y轴指示线(这里length不需要取绝对值，内部计算需要带正负来计算)
		_drawLineGrid(ctx, { ...axisY, ...yCoor, ...gridY, gridLength : xCoor.end[0]-xCoor.begin[0] });
//		//绘制x轴文案
		_drawLineLabel(ctx, { ...labelX, ...xCoor, data : formatData });
//		//绘制y轴文案
		_drawLineLabel(ctx, { ...labelY, ...yCoor, data : formatData });
	}

	//绘制数据
	drawData(ctx){
		let { xCoor , yCoor , formatData } = this.state;
		let { width , height , labelY , dataLine , data } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		//绘制数据
		_drawLineData(ctx, { key : labelY.key , data : formatData , xCoor , yCoor, ...dataLine });
	}

	//绘制鼠标悬浮数据层
	drawBlock(e){
		let { top , right , bottom , left } = this.getPosition();
		let { width , height , labelX , labelY , dataLine , dataBlock } = this.state.props;
		let { canvasId , xCoor , yCoor , formatData } = this.state;
		let ctx = _getCtx.call(this, canvasId[2]);
		let flag = e.offsetX >= left && e.offsetX <= width - right && e.offsetY >= top && e.offsetY <= height-bottom;
		ctx.clearRect(0, 0, width, width);
		if(flag){
			_drawLineDataBlock(ctx, {
				...dataBlock,
				xCoor,
				yCoor,
				data : formatData,
				scale : [e.offsetX, e.offsetY],
				xKey : labelX.key,
				yKey : Array.isArray(labelY.key) && labelY.key || [],
				yLabel : Array.isArray(labelY.label) && labelY.label || [],
				fontColor : dataLine.strokeStyle
			});
		}else{
			ctx.clearRect(0, 0, width, height)
		}
	}

	//绘制折线图标题
	drawTitle(){
		let { width , title } = this.state.props;
		let { position , label , style = {} } = title;
		style = { ...style , width };
		style[position] = 0;
		this.setState({ titleDOM : (<div className = { 'line_title' } style = { style }>{ label }</div>) })
	}

	//绘制数据含义工具栏
	drawTooltip(){
		let { tooltipPro } = this.state;
		let { width , tooltip , labelY , dataLine } = this.state.props;
		let { position , childLineHeight , childLineWidth , height , disabledColor } = tooltip;
		let { key , label } = labelY;
		if(!tooltipPro.key || tooltipPro.key.length === 0){
			tooltipPro.key = [];
			for(let i = 0 ; i < key.length ; i++){
				tooltipPro.key.push({ key : key[i] , show : true , label : label[i] || key[i] });
			}
		}
		/**
		 * 宽度取canvas的宽度
		 * 高度取tooltip定义的高度
		 * 定位设置已设置tooltip为绝对定位，修改相应的position属性为0即可
		 */
		let style = { width , height };
		style[position] = 0;
		tooltipPro.node = (
			<div className = { 'line_tooltip' } style = { style }>
				{ tooltipPro.key.map((item, index) => (
					<div key = { item.key } onClick = {() => this.changeData(item.key)}>
						<div style = {{ height : childLineHeight , width : childLineWidth , marginRight : 5 , background : item.show ? dataLine.strokeStyle[index%dataLine.strokeStyle.length] : disabledColor }}></div>
						{/*如果没有获取到相应的label，则显示key*/}
						<div style = {{ color : item.show ? '#000' : disabledColor }}>{ item.label }</div>
					</div>
					))
				}
			</div>
		)
		this.setState({ tooltipPro });
	}

	//点击tooltip中的项目可以显隐该数据
	changeData(item){
		let { tooltipPro , formatData } = this.state;
		let { data } = this.state.props;
		for(let i = 0 ; i < formatData.length ; i++){
			if(_isExist(formatData[i][item])){
				delete formatData[i][item]
			}else{
				formatData[i][item] = data[i][item];
			}
		}
		for(let i = 0 ; i < tooltipPro.key.length ; i++){
			if(item === tooltipPro.key[i].key){
				tooltipPro.key[i].show = !tooltipPro.key[i].show;
			}
		}
		this.setState({ formatData , tooltipPro }, () => this.init());
	}

	render(){
		let { canvasId , titleDOM , tooltipPro , mouseEvent } = this.state;
		let { width , height , coordinate } = this.state.props;
		return(
			<div className = { 'line_all' } style = {{ width , height }}>
				{ canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = { 'line_canvas' }></canvas>) }
				{ titleDOM }
				{ tooltipPro.node }
			</div>
		)
	}
}

Line.defaultProps = {
	width : 1000,				//canvas的宽度
	height : 500,				//canvas的高度
	innerGap : [60,40,70,40],	//canvas内边距(上右下左)
	axisX : { show : true , strokeStyle : '#5d9cec' , lineWidth : 2 , setLineDash : [] },
	axisY : { show : true , strokeStyle : '#5d9cec' , lineWidth : 2 , setLineDash : [] },
	scaleX : { scaleLength : 0 , strokeStyle : '#5d9' , lineWidth : 2 },									//基于x轴的刻度线(刻度线数量为data数组长度)
	scaleY : { scaleNum : 0 , scaleLength : 10 , lineWidth : 2 },					//基于y轴的可短线(刻度线数量自定义)
	gridX : { show : false , strokeStyle : '#000' , lineWidth : 1 , setLineDash : [4, 4] },		//基于x轴的指示线
	gridY : { show : true , gridNum : 5, strokeStyle : '#000' , lineWidth : 1 , setLineDash : [4, 4] },				//基于y轴的指示线
	labelX : { key : 'x' , label : '日期' },												//x轴取值键名及文案说明
	labelY : { key : ['weight','IQ','EQ','NQ'] , label : ['体重','智商','情商','智障'] , labelNum : 5 },	//y轴取值键名及文案说明
	dataLine : { strokeStyle : ['red','green','blue','violet'] , lineWidth : 3 , line : true , dot : true , dotRadius : 4 },				//数据展示线条属性
	tooltip : { position : 'bottom' , childLineHeight : 5 , childLineWidth : 40 , height : 60 , disabledColor : '#ddd' },	//工具提示
	title : { position : 'top' , label : '人体状况图（α测试）' , style : { fontSize : 16 , color : '#000' , height : 60 } },
	dataBlock : { rectWidth : 100 , lineWidth : 1 , setLineDash : [4, 4] , lineHeight : 20 , fillStyle : 'rgba(93,156,236,.3)' },
	data : [{
		x : '2012-12-12' , weight : 200 , IQ : 300 , EQ : 138 , NQ : 100
	},{
		x : '2012-12-13' , weight : 100 , IQ : 200 , EQ : 500 , NQ : 150
	},{
		x : '2012-12-14' , weight : 200 , IQ : 100 , EQ : 172 , NQ : 89
	},{
		x : '2012-12-15' , weight : 150 , IQ : 0 , EQ : 146 , NQ : 200
	},{
		x : '2012-12-16' , weight : 200 , IQ : 100 , EQ : 250 , NQ : 165
	},{
		x : '2012-12-17' , weight : 100 , IQ : 200 , EQ : 125 , NQ : 138
	},{
		x : '2012-12-18' , weight : 200 , IQ : 300 , EQ : 250 , NQ : 50
	}]
}

export default Line;
