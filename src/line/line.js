import React from 'react';
import { _getMax } from '../../utils/calc.js';
import { _getCtx, _drawLine } from '../../utils/canvas.js';
import styles from './line.less';

const { _drawCoor , _drawScale , _drawGrid , _drawLabel , _drawData } = _drawLine();

/**
 * 折线图
 */
class Line extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back'],
			tooltipDOM : undefined,
			initScale : [],				//笛卡尔坐标原点
			props : {}
		}
	}

	//格式化上下左右
	getPosition(){
		let { innerGap } = this.state.props;
		return { top : innerGap[0] , right : innerGap[1] , bottom : innerGap[2] , left : innerGap[3] };
	}

	//组件完全受控，将props存入state的props对象中
	componentDidMount(){
		this.setState({ props : this.props }, () => this.init());
	}

	//组件完全受控，将props存入state的props对象中
	componentWillReceiveProps(nextProps){
		this.setState({ props : nextProps }, () => this.init())
	}

	init(){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		let { top , right , bottom , left } = this.getPosition();
		let ctxBack = _getCtx.call(this, canvasId[0]);
		let ctxToolTip = _getCtx.call(this, canvasId[1]);
		//更新笛卡尔坐标轴原点坐标
		this.setState({ initScale : [left, height - bottom] }, () => {
			this.drawBack(ctxBack);
			this.drawTooltip()
		})
	}

	drawBack(ctx){
		let { initScale } = this.state;
		let { width , height , axisX , axisY , scaleX , scaleY , gridX , gridY , labelX , labelY , dataLine , data } = this.state.props;
		let { top , right , bottom , left } = this.getPosition();
		let xCoor = { begin : initScale , end : [width - right, height - bottom] };
		let yCoor = { begin : initScale , end : [left, top] };
		//绘制x轴
		_drawCoor(ctx, { ...axisX, ...xCoor });
		//绘制y轴
		_drawCoor(ctx, { ...axisY, ...yCoor });
		//绘制x轴刻度
		_drawScale(ctx, { ...axisX, ...xCoor, ...scaleX, scaleNum : data.length });
		//绘制y轴刻度
		_drawScale(ctx, { ...axisY, ...yCoor, ...scaleY });
		//绘制x轴指示线(绘制x轴指示线，指示线数量为data.length,指示线长度这里length不需要取绝对值，内部计算需要带正负来计算)
		_drawGrid(ctx, { ...axisX, ...xCoor, ...gridX, gridNum : data.length , gridLength : yCoor.end[1]-yCoor.begin[1] });
		//绘制y轴指示线(这里length不需要取绝对值，内部计算需要带正负来计算)
		_drawGrid(ctx, { ...axisY, ...yCoor, ...gridY, gridLength : xCoor.end[0]-xCoor.begin[0] });
		//绘制x轴文案
		_drawLabel(ctx, { ...labelX, ...xCoor, data });
		//绘制y轴文案
		_drawLabel(ctx, { ...labelY, ...yCoor, data });
		//绘制数据
		_drawData(ctx, { key : labelY.key, data, xCoor, yCoor, ...dataLine })
	}

	drawTooltip(){
		let { width , tooltip , labelY , dataLine } = this.state.props;
		let { position , height , childLineHeight , childLineWidth } = tooltip;
		let { key , label } = labelY;
		/**
		 * 宽度取canvas的宽度
		 * 高度取tooltip定义的高度
		 * 定位设置已设置tooltip为绝对定位，修改相应的position属性为0即可
		 */
		let style = { height , width };
		style[position] = 0;
		let tooltipDOM = (
			<div className = { 'line_tooltip' } style = { style }>
				{ key.map((item, index) => (
					<div>
						<div style = {{ height : childLineHeight , width : childLineWidth , marginRight : 5 , background : dataLine.strokeStyle[index%dataLine.strokeStyle.length] }}></div>
						{/*如果没有获取到相应的label，则显示key*/}
						<div>{ label[index] || item }</div>
					</div>
					))
				}
			</div>
		)
		this.setState({ tooltipDOM })
	}

	render(){
		let { canvasId , tooltipDOM } = this.state;
		let { width , height , coordinate } = this.state.props;
		return(
			<div className = { 'line_all' } style = {{ width , height }}>
				{ canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = { 'line_canvas' }></canvas>) }
				{ tooltipDOM }
			</div>
		)
	}
}

Line.defaultProps = {
	width : 1000,				//canvas的宽度
	height : 500,				//canvas的高度
	innerGap : [40,40,80,40],	//canvas内边距(上右下左)
	axisX : { show : true , strokeStyle : '#5d9cec' , lineWidth : 2 , setLineDash : [] },
	axisY : { show : true , strokeStyle : '#5d9cec' , lineWidth : 2 , setLineDash : [] },
	scaleX : { scaleLength : 0 },									//基于x轴的刻度线(刻度线数量为data数组长度)
	scaleY : { scaleNum : 5 , scaleLength : 0 },					//基于y轴的可短线(刻度线数量自定义)
	gridX : { strokeStyle : '#000' , setLineDash : [4, 4] },		//基于x轴的指示线
	gridY : { gridNum : 5 , strokeStyle : '#000' , setLineDash : [4, 4] },				//基于y轴的指示线
	labelX : { key : 'x' , label : '日期' },												//x轴取值键名及文案说明
	labelY : { key : ['weight','IQ','EQ'] , label : ['体重','智商','情商'] , labelNum : 5 },	//y轴取值键名及文案说明
	dataLine : { strokeStyle : ['red','green','blue'] , lineWidth : 3 , dot : true },				//数据展示线条属性
	tooltip : { position : 'bottom' , height : 60 , childLineHeight : 5 , childLineWidth : 40 },	//工具提示
	data : [{
		x : '2012-12-12' , weight : 0 , IQ : 300 , EQ : 250
	},{
		x : '2012-12-13' , weight : 100 , IQ : 200 , EQ : 125
	},{
		x : '2012-12-14' , weight : 200 , IQ : 100 , EQ : 250
	},{
		x : '2012-12-15' , weight : 300 , IQ : 0 , EQ : 125
	},{
		x : '2012-12-16' , weight : 200 , IQ : 100 , EQ : 250
	},{
		x : '2012-12-17' , weight : 100 , IQ : 200 , EQ : 120
	},{
		x : '2012-12-18' , weight : 0 , IQ : 300 , EQ : 250
	}]
}

export default Line;
