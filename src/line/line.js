import React from 'react';
import { _getCtx , _getMax } from '../../utils/func.js';
import './line.less';

/**
 * 折线图
 */
class Line extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back'],
			tooltipDOM : undefined,
			initScale : [],
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
		//更新坐标轴原点坐标
		let initScale = [left, height - bottom];
		this.setState({ initScale }, () => {
			this.drawBack(ctxBack);
			this.drawTooltip()
		})
	}

	//绘制坐标系
	drawBack(ctx){
		//绘制x轴
		let drawCoorX = this.drawCoorX(ctx);
		//绘制y轴
		let drawCoorY = this.drawCoorY(ctx);
		//绘制关于x轴的相应参数
		this.drawBackContent(ctx, drawCoorX);
		//绘制关于y轴的相应参数
		this.drawBackContent(ctx, drawCoorY);
	}

	//绘制x轴
	drawCoorX(ctx){
		let { initScale } = this.state;
		let { width , height , coordinate } = this.state.props;
		let { lineWidth , axisX } = coordinate;
		let { arrow , show , setLineDash } = axisX;
		let { top , right , bottom , left } = this.getPosition();
		if(show){
			ctx.save();
			ctx.beginPath();
			setLineDash && setLineDash.length > 0 && ctx.setLineDash(setLineDash);
			ctx.moveTo.apply(ctx, initScale);
			ctx.lineTo(width - right, height - bottom);
			//是否绘制箭头
			if(arrow){
				//绘制箭头上半部分
				ctx.lineTo(width - right - arrowLength * Math.cos(arrowAngle), height - bottom - arrowLength * Math.sin(arrowAngle));
				//绘制箭头下半部分
				ctx.moveTo(width - right, height - bottom);
				ctx.lineTo(width - right - arrowLength * Math.cos(arrowAngle), height - bottom + arrowLength * Math.sin(arrowAngle));
			}
			ctx.lineWidth = lineWidth;
			ctx.stroke();
			ctx.restore();
		}
		return { type : 'axisX' , begin : { x : initScale[0] , y : initScale[1] } , end : { x : width - right, y : height - bottom } , getLength : function(){
			return Math.abs(this.end.x - this.begin.x)
		} };
	}

	//绘制y轴
	drawCoorY(ctx){
		let { initScale } = this.state;
		let { width , height , coordinate } = this.state.props;
		let { lineWidth , axisY } = coordinate;
		let { arrow , show , setLineDash } = axisY;
		let { top , right , bottom , left } = this.getPosition();
		if(show){
			ctx.save();
			ctx.beginPath();
			setLineDash && setLineDash.length > 0 && ctx.setLineDash(setLineDash);
			ctx.moveTo.apply(ctx, initScale);
			ctx.lineTo(left, top);
			//是否绘制箭头
			if(arrow){
				//绘制箭头左侧
				ctx.lineTo(left - arrowLength * Math.sin(arrowAngle), top + arrowLength * Math.cos(arrowAngle));
				//绘制箭头右侧
				ctx.moveTo(left, top);
				ctx.lineTo(left + arrowLength * Math.sin(arrowAngle), top + arrowLength * Math.cos(arrowAngle));
			}
			ctx.lineWidth = lineWidth;
			ctx.stroke();
			ctx.restore();
		}
		return { type : 'axisY' , begin : { x : initScale[0], y : initScale[1]} , end : { x : left, y : top } , getLength : function(){
			return Math.abs(this.end.y - this.begin.y)
		} };
	}

	//绘制toolTip
	drawTooltip(ctx){
		let { tooltipDOM } = this.state;
		let { width , tooltip , coordinate , data } = this.state.props;
		let { axisY , line , dot } = data;
		let { key , label } = axisY;
		let gapPosition = this.getPosition();
		let style = { width , height : gapPosition[tooltip.position] - 12 };
		style[tooltip.position] = 0;
		tooltipDOM = (
			<div className = 'line_tooltip' style = { style }>
				{ key.map((item, index) => (
					<div>
						<div style = {{ height : tooltip.height , width : tooltip.width , marginRight : 5 , background : line.strokeStyle[index%line.strokeStyle.length] }}></div>
						{/*如果没有获取到相应的label，则显示key*/}
						<div>{ label[index] || item }</div>
					</div>
					))
				}
			</div>
		)
		this.setState({ tooltipDOM })
	}

	//绘制关于坐标轴的相应参数
	drawBackContent(ctx, scaleParams){
		let { width , height , coordinate , data } = this.state.props;
		let { scaleLength , scaleNum } = coordinate;
		let { type , begin , end } = scaleParams;
		let { top , right , bottom , left } = this.getPosition();
		let { sourceKey , axisX , axisY } = data;
		//比如说有5个数据，则分为了4块，所以要length-1
		//相邻刻度之间的长度
		let length = scaleParams.getLength();
		//x和y的坐标
		let cx, cy;
		//如果刻度线长度不存在或者非非正数，默认刻度线为0
		scaleLength = isNaN(scaleLength) ? 0 : scaleLength;
		if(type === 'axisX'){
			let dataSource = [];
			//当前有{data[sourceKey].length}个数据，说明有{data[sourceKey].length-1}个区域
			length = length/(data[sourceKey].length-1);
			data[sourceKey].map((item, i) => {
				cx = begin.x + length * i;
				cy = begin.y;
				//绘制指示线
				this.drawGrid(ctx, type, [cx, cy], [cx, top]);
				//绘制刻度线，首刻度线不渲染
				this.drawScale(ctx, [cx, cy], [cx, cy+scaleLength], i);
				//绘制坐标轴文案
				this.drawLabel(ctx, data[sourceKey][i][data.axisX.key], cx, cy+5, { textAlign : 'center' , textBaseline : 'top' });
				//x的坐标数组，循环之后再统一绘制数据
				let obj = {};
				axisY.key.map((keyItem, keyIndex) => {
					obj[keyItem] = item[keyItem];
				})
				obj.x = cx;
				dataSource.push(obj);
			})
			this.drawData(ctx, dataSource);
		}
		if(type === 'axisY'){
			//当前有{scaleNum}个刻度线，就有{scaleNum+1}个区域
			//遍历的时候要包含首尾，所以{scaleNum+2}
			length = length/(scaleNum-1);
			let max = 0;
			axisY.key.map((item, index) => {
				max = Math.max(max, _getMax(data[sourceKey], item))
			})
			for(let i = 0 ; i < scaleNum ; i++){
				cx = begin.x;
				cy = begin.y - length * i;
				//绘制指示线
				this.drawGrid(ctx, type, [cx, cy], [width - right, cy]);
				//绘制刻度线，首刻度线不渲染
				this.drawScale(ctx, [cx, cy], [cx-scaleLength, cy], i);
				//绘制坐标轴文案
				this.drawLabel(ctx, max/(scaleNum-1)*i, cx-5, cy, { textAlign : 'end' , textBaseline : 'middle' });
			}
		}
	}

	//绘制刻度线
	drawScale(ctx, begin, end, index){
		//首(原点)刻度线不绘制
		if(index > 0){
			ctx.save();
			ctx.beginPath();
			ctx.moveTo.apply(ctx, begin);
			ctx.lineTo.apply(ctx, end);
			ctx.stroke();
			ctx.restore();
		}
	}

	//绘制坐标轴文案
	drawLabel(ctx, text, x, y, props){
		let { textAlign , textBaseline } = props;
		ctx.save();
		ctx.textAlign = textAlign;
		ctx.textBaseline = textBaseline;
		ctx.fillText(!isNaN(text) ? Math.round(text) : text, x, y);
		ctx.restore();
	}

	//绘制指示线
	drawGrid(ctx, type, begin, end){
		let grid = this.state.props.coordinate[type].grid || {};
		let { show , setLineDash } = grid;
		//如果指示线标志show为true
		//如果x轴或y轴已经绘制，则不绘制与x，y轴重合的指示线
		if(show){
			ctx.save();
			ctx.beginPath();
			setLineDash && setLineDash.length > 0 && ctx.setLineDash(setLineDash);
			ctx.moveTo.apply(ctx, begin);
			ctx.lineTo.apply(ctx, end);
			ctx.stroke();
			ctx.restore();
		}
	}

	//绘制数据
	drawData(ctx, dataSource = []){
		let { initScale } = this.state;
		let { height , data } = this.state.props;
		let { sourceKey , lineWidth , line , dot , axisY } = data;
		let { top , left , right , bottom } = this.getPosition();
		let max = 0;
		axisY.key.map((item, index) => {
			max = Math.max(max, _getMax(data[sourceKey], item))
		})
		//绘制折线
		line && line.show && axisY.key.map((keyItem, keyIndex) => {
			let { lineWidth , strokeStyle } = line;
			ctx.save();
			ctx.beginPath();
			dataSource.map((item, index) => {
				let coor = [item.x, top+(height-top-bottom)*(1-item[keyItem]/max)];
				//如果是第一项，则移动到当前位置
				index === 0 && ctx.moveTo.apply(ctx, coor);
				//如果不是第一项，则开始画线
				index > 0 && ctx.lineTo.apply(ctx, coor);
			});
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle[keyIndex % strokeStyle.length],
			ctx.stroke();
			ctx.restore();
		});
		//绘制拐点
		dot && dot.show && axisY.key.map((keyItem, keyIndex) => {
			let { radius , fillStyle } = dot;
			ctx.save();
			dataSource.map((item, index) => {
				let coor = [item.x, top+(height-top-bottom)*(1-item[keyItem]/max)];
				ctx.beginPath();
				ctx.arc(coor[0], coor[1], radius, 0, 2 * Math.PI);
				ctx.fillStyle = fillStyle[keyIndex % fillStyle.length];
				ctx.fill();
			});
			ctx.restore();
		})
	}

	render(){
		let { canvasId , tooltipDOM } = this.state;
		let { width , height , coordinate } = this.state.props;
		return(
			<div className = 'line_all' style = {{ width , height }}>
				{ canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = 'line_canvas'></canvas>) }
				{ tooltipDOM }
			</div>
		)
	}
}

Line.defaultProps = {
	width : 800,				//canvas的宽度
	height : 400,				//canvas的高度
	innerGap : [40,40,60,40],	//canvas内边距(上右下左)
	coordinate : {
		//show是否限制坐标轴 arrow是否显示箭头 setLineDash是否是虚线坐标轴 textGap坐标轴和文案间距 grid是否有指示线
		axisX : { show : true , arrow : false , setLineDash : [] , grid : { show : true , setLineDash : [2,2] } },
		axisY : { show : true , arrow : false , setLineDash : [] , grid : { show : true , setLineDash : [2,2] } },
		arrowAngle : Math.PI/6,		//坐标轴箭头角度
		arrowLength : 15,			//坐标轴箭头长度
		lineWidth : 1,	 			//坐标轴线宽
		scaleLength : 0,			//刻度线长度
		scaleNum : 6,				//y轴的刻度数量
	},
	tooltip : {
		position : 'bottom',
		width : 40,					//每条线的宽度
		height : 4,					//每条线的高度
	},
	data : {
		axisX : { key : 'x' , label : '日期' },	   										//x轴取值的键名，对应source中x轴的键名
		axisY : { key : ['num','y','ht'] , label : ['体重','IQ','EQ'] },	   	  			//x轴取值的键名，对应source中x轴的键名
		line : { show : true , lineWidth : 2 , strokeStyle : ['red','#5d9','blue'] },	//折现颜色数组
		dot : { show : true , radius : 4 , fillStyle : ['red','#5d9','blue'] },			//折点颜色
		sourceKey : 'source',						//对应数据的键名
		source : [{
			x : '2012-12-12' , num : 400 , y : 150 , ht : 250
		},{
			x : '2012-12-13' , num : 180 , y : 100 , ht : 125
		},{
			x : '2012-12-14' , num : 130 , y : 150 , ht : 250
		},{
			x : '2012-12-15' , num : 80 , y : 80 , ht : 125
		},{
			x : '2012-12-16' , num : 150 , y : 120 , ht : 250
		},{
			x : '2012-12-17' , num : 300 , y : 200 , ht : 125
		},{
			x : '2012-12-18' , num : 60 , y : 350 , ht : 450
		}]
	}
}

export default Line;
