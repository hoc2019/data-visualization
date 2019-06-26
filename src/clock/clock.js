import React from 'react';
import { _getCtx } from '../../utils/canvas.js';
import './clock.less';

/**
 * 时钟
 */
class Clock extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back', 'pointer'],
			hourNums : [3,4,5,6,7,8,9,10,11,12,1,2],
			center : [],
			props : {}
		}
	}

	//组件完全受控，将props存入state的props对象中
	componentWillReceiveProps(nextProps){
		this.setState({ props : nextProps }, () => this.init())
	}

	//组件完全受控，将props存入state的props对象中
	componentDidMount(){
		this.setState({ props : this.props }, () => this.init());
	}

	//初始化方法
	init(){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		let ctxBack = _getCtx.call(this, canvasId[0]);
		let ctxPointer = _getCtx.call(this, canvasId[1]);
		let center = [ Math.round(width/2), Math.round(height/2) ];
		this.setState({ center }, () => {
			this.drawClockBack(ctxBack);
			this.drawClockPointer(ctxPointer);
		})
	}

	//绘制钟背景
	drawClockBack(ctx){
		let { center } = this.state;
		ctx.save();
		ctx.translate(center[0], center[1]);
		this.drawClockBackground(ctx);
		this.drawClockScale(ctx);
		this.drawClockNum(ctx);
		ctx.restore();
	}

	drawClockBackground(ctx){
		let { width , height , radius , clockWidth , clockStrokeStyle } = this.state.props;
		ctx.save();
        ctx.beginPath();
        ctx.lineWidth = clockWidth;
		ctx.strokeStyle = clockStrokeStyle;
        ctx.arc(0, 0, radius, 0, 2*Math.PI, false);
        ctx.stroke();
		ctx.restore();
	}

	//绘制钟刻度
	drawClockScale(ctx){
		ctx.save();
		let { radius , scaleGap } = this.state.props;
		for(let i = 0 ; i < 60 ; i++){
            let rad = 2 * Math.PI / 60 * i;
            let x = Math.cos(rad) * (radius - scaleGap);
            let y = Math.sin(rad) * (radius - scaleGap);
            ctx.beginPath();
            if(i % 5 == 0){
                ctx.fillStyle = '#000';
                ctx.arc(x,y,2,0,2*Math.PI,false);
            }else{
                ctx.fillStyle = '#ccc';
                ctx.arc(x,y,2,0,2*Math.PI,false);
            }
            ctx.fill();
        }
		ctx.restore();
	}

	//绘制钟数字
	drawClockNum(ctx){
		let { hourNums } = this.state;
		let { radius , numberGap } = this.state.props;
		ctx.save();
		ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        hourNums.map((item,index) => {
            let rad = 2 * Math.PI / 12 * index;
            let x = Math.cos(rad) * (radius - numberGap);
            let y = Math.sin(rad) * (radius - numberGap);
            ctx.fillText(item,x,y);
        });
		ctx.restore();
	}

	//绘制钟指针
	drawClockPointer(ctx){
		let { center } = this.state;
		let { width , height } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		ctx.save();
		ctx.translate(center[0], center[1]);
		this.drawHour(ctx);
        this.drawMinute(ctx);
        this.drawSecond(ctx);
		this.drawCenterDot(ctx);
		ctx.restore();
		let t = setTimeout(() => {
			this.drawClockPointer(ctx);
			clearTimeout(t);
		}, 1000)
	}

	//绘制时针
	drawHour(ctx){
		let { hourPointer } = this.state.props;
        let rad = 2 * Math.PI / 12 * new Date().getHours();
        let m_rad = 2 * Math.PI / 12 / 60 * new Date().getMinutes();
		this.drawPointer(ctx, { rad : rad + m_rad , ...hourPointer });
	}

	//绘制分针
	drawMinute(ctx){
		let { minutePointer } = this.state.props;
		let rad = 2 * Math.PI / 60 * new Date().getMinutes();
		this.drawPointer(ctx, { rad , ...minutePointer });
	}

	//绘制秒针
	drawSecond(ctx){
		let { secondPointer } = this.state.props;
		let rad = 2 * Math.PI / 60 * new Date().getSeconds();
		this.drawPointer(ctx, { rad , ...secondPointer });
	}

	//绘制中心点
	drawCenterDot(ctx){
		let { centerDot } = this.state.props;
		let { radius , fillStyle } = centerDot;
		ctx.save();
		ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
        ctx.fill();
		ctx.restore();
	}

	//绘制指针公共方法
	drawPointer(ctx, props){
		let { rad , lineWidth , length , strokeStyle } = props;
		ctx.save();
        ctx.beginPath();
        ctx.rotate(rad);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
		ctx.strokeStyle = strokeStyle;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
	}

	render(){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		return(
			<div className = { 'clock_all' } style = {{ width , height }}>
				{ canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = { 'clock_canvas' }></canvas>) }
			</div>
		)
	}
}

Clock.defaultProps = {
	width : 450,	//canvas宽度
	height : 450,	//canvas宽高度
	radius : 150,	//钟半径
	clockWidth : 8,	//钟边框宽度
	clockStrokeStyle : '#000',	//钟边框颜色
	scaleGap : 15,	//钟刻度距离边框的距离
	numberGap : 30,	//钟数字距离边框的距离
	hourPointer : { lineWidth : 4 , length : 70 , strokeStyle : '#5d9' },			//时针属性 线宽 长度 线条色
	minutePointer : { lineWidth : 3 , length : 90 , strokeStyle : '#5d9cec' },		//分针属性 线宽 长度 线条色
	secondPointer : { lineWidth : 2 , length : 110 , strokeStyle : '#000' },		//秒针属性 线宽 长度 线条色
	centerDot : { radius : 4 , fillStyle : '#000' },								//重点属性 半径 填充色
}

export default Clock;
