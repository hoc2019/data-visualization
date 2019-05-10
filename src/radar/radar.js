import React from 'react';
import { _getRate , _getMax } from '../../utils/calc.js';
import { _getCtx } from '../../utils/canvas.js';
import styles from './radar.less';

/**
 * 雷达图
 * 2个canvas 1个绘制背景 1个绘制数据
 */
class Radar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back', 'data'],
			lengthLimit : 3,			//雷达图数据长度限制
			center : {},				//canvas中心位置坐标
			props : {}
		}
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
		let ctxBack = _getCtx.call(this, canvasId[0]);
		let center = {
			x : Math.round(width/2),
			y : Math.round(height/2)
		};
		//设置canvas中心位置
		this.setState({ center }, () => {
			this.drawBack(ctxBack);
		});
	}

	//绘制雷达图圆心
	drwaCenterDot(ctx){
		let { center } = this.state;
		ctx.save();
		ctx.beginPath();
		ctx.translate(center.x,center.y);
		ctx.arc(0, 0, 3, 0, 2 * Math.PI);
		ctx.fillStyle = '#000';
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	//绘制雷达图
	drawRadar(ctx, length){
		let { center } = this.state;
		let { data , width , height , radius , scaleLine , guideLine } = this.state.props;
		let { lineWidth , lineColor } = scaleLine;
		let { print } = guideLine;
		let rad = Math.PI * 2 / data.length;
		let dotArr = []; 				//雷达节点数组
		let dataArr = [];				//数据值数组
		let x, y;						//当前x，y坐标
		let outSideFlag = length >= radius;		//是否在绘制最外层
		ctx.save();
		ctx.beginPath();
		ctx.translate(center.x,center.y);
		ctx.moveTo(0, -length);
		for(let i = 0 ; i < data.length ; i++){
			x = -length * Math.sin(rad * i);
			y = -length * Math.cos(rad * i);
			//绘制雷达线(雷达线需要闭环)
			this.drawLine(ctx, x, y);
			if(outSideFlag){
				//绘制雷达文本(遍历从1开始，所以这里要取前一个索引)
				this.drawLabel(ctx, x, y, data[i]);
				//添加指示线坐标数组
				dotArr.push({x, y});
				//添加数据(遍历从1开始，所以这里要取前一个索引)
				dataArr.push({x, y, item : data[i]})
			}
		}
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = lineColor;
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
		//如果是最外层且允许绘制指示线 则绘制指示线
		if(outSideFlag && print){
			this.drawGuideLine(ctx, dotArr);
		}
		//绘制数据层
		if(outSideFlag){
			this.drawData(dataArr);
		}
	}

	//绘制雷达线
	drawLine(ctx, x, y){
		ctx.lineTo(x, y);
	}

	//绘制文案
	drawLabel(ctx, x, y, item){
		let { data , labelRender } = this.state.props;
		let { label , value , color , textGap , defaultColor , font , render } = labelRender;
		label = item[label] || '';
		color = item[color] || defaultColor;
		//js计算偏差，这里四舍五入
		x = Math.round(x);
		y = Math.round(y);
		//计算文案的位置
		if(x > 0){ x += textGap }else if(x < 0){ x -= textGap }
		if(y > 0){ y += textGap }else if(y < 0){ y -= textGap }
		ctx.font = font;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = color;
		//render是开发者自定义的渲染方法，如果是方法并且有返回值，则使用开发者自定义的，否则用默认的
		ctx.fillText(typeof render === 'function' && render(item, labelRender) ? render(item, labelRender) : label, x, y);
	}

	//绘制雷达图指示线
	drawGuideLine(ctx, dotArr){
		let { center } = this.state;
		let { guideLine } = this.state.props;
		let { dash , setLineDash , strokeStyle , lineWidth } = guideLine;
		for(let i = 0 ; i < dotArr.length ; i++){
			ctx.save();
			ctx.beginPath();
			ctx.translate(center.x, center.y);
			//如果需要绘制虚线则绘制虚线
			setLineDash && setLineDash.length > 0 && ctx.setLineDash(setLineDash)
			ctx.moveTo(0,0);
			ctx.lineTo(dotArr[i].x, dotArr[i].y);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle;
			ctx.stroke();
			ctx.restore();
		}
	}

	//绘制数据(为了让数据浮于最上层，需要重启一个canvas)
	drawData(dataArr){
		let { canvasId , center } = this.state;
		let { data , labelRender , dataRender } = this.state.props;
		let { value } = labelRender;
		let { dash , strokeStyle , lineWidth , fillStyle , setLineDash } = dataRender;
		let ctx = _getCtx.call(this, canvasId[1]);
		//取出最大值作为刻度的100%
		let max = _getMax(data, value);
		ctx.save();
		ctx.beginPath();
		ctx.translate(center.x,center.y);
		ctx.moveTo(dataArr[0].x * _getRate(dataArr[0].item[value], max), dataArr[0].y * _getRate(dataArr[0].item[value], max));
		for(let i = 0 ; i < dataArr.length ; i++){
			ctx.lineTo(dataArr[i].x * _getRate(dataArr[i].item[value], max), dataArr[i].y * _getRate(dataArr[i].item[value], max))
		}
		ctx.closePath();
		//是否虚线
		if(dash){
			ctx.setLineDash(setLineDash);
		}
		//是否有边框
		if(strokeStyle){
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		}
		//是否有填充色
		if(fillStyle){
			ctx.fillStyle = fillStyle;
			ctx.fill();
		}
		ctx.restore();
	}

	drawBack(ctx){
		let { lengthLimit } = this.state;
		let { data , width , height , radius , lineWidth , scaleLine } = this.state.props;
		let { gridNum } = scaleLine;
		ctx.clearRect(0, 0, width, height);
		//只有在参数项>={lengthLimit}的时候才有绘制雷达图的必要
		if(data.length >= lengthLimit){
			for(let i = 0 ; i < gridNum ; i++){
				this.drawRadar(ctx, radius - (radius/gridNum) * i);
			}
			this.drwaCenterDot(ctx);
		}
	}

	render(){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		return(
			<div className = 'radar_area'>
				 { canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = 'radar_canvas'></canvas>) }
			</div>
		)
	}
}

Radar.defaultProps = {
	width : 400,				//canvas的宽度
	height : 400,				//canvas的高度
	radius : 120,				//雷达图的半径
	scaleLine : {
		lineWidth : 3,			//雷达图刻度线宽
		lineColor : '#5d9cec',	//雷达图刻度线颜色
		gridNum : 3,			//雷达图内含环数
	},
	guideLine : {
		print : true,			//是否绘制指示线
		setLineDash : [5, 5],	//指示线参数[长度，间隔]
		lineWidth : 2,			//指示线宽度
		strokeStyle : '#5d9',	//指示线线颜色
	},
	labelRender : {
		label : 'name',			//需要渲染的名称键名 对应data种需要渲染的名称
		value : 'score',		//需要渲染值的键名 对应data种需要渲染的数值
		color : 'color',		//自定义需要渲染的颜色的键名 对应data中渲染的颜色
		textGap : 15,			//文案和图的间距
		defaultColor : '#000',	//默认字体的颜色
		font : '16px Arial',	//文案默认字体大小和字体种类
		render : (item, params) => `${item[params.label] || ''}${!isNaN(item[params.value]) ? '(' + item[params.value] + ')' : ''}`
	},
	dataRender : {
		dash : false,			//是否是虚线
		setLineDash : [2, 2],	//虚线参数[长度，间隔]
		strokeStyle : '#000',	//边框颜色
		lineWidth : 1,			//边框宽度
		fillStyle : 'rgba(225, 225, 0, .9)',	//填充色
	},
	data : [{
		name : 'A',
		score : 120,
		color : 'aqua'
	},{
		name : 'B',
		score : 60,
		color : 'red'
	},{
		name : 'C',
		score : 60
	},{
		name : 'D',
		score : 60,
		color : 'blue',
	},{
		name : 'E',
		score : 60,
		color : 'green'
	},{
		name : 'F',
		score : 60,
		color : 'yellow'
	},{
		name : 'G',
		score : 60
	},{
		name : 'H',
		score : 60
	}]							//展示数据
}

export default Radar;
