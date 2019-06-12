import React from 'react';
import styles from './dash-board.less';
//import { _deepCopy } from '../utils/validator.js';
import { _getCtx , _drawDashBoard } from '../utils/canvas.js';

const obj = _drawDashBoard();
const _setDashBoardCenter = obj._setDashBoardCenter.bind(obj);
const _drawDashBoardBack = obj._drawDashBoardBack.bind(obj);
const _drawDashBoardCenterDot = obj._drawDashBoardCenterDot.bind(obj);
const _drawDashBoardScale = obj._drawDashBoardScale.bind(obj);
const _drawDashBoardDataLine = obj._drawDashBoardDataLine.bind(obj);

/**
 * 仪表盘
 */
class DashBoard extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back', 'data'],
			props : {},
			center : []
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
		let ctxData = _getCtx.call(this, canvasId[1]);
		let center = [ Math.round(width/2), Math.round(height/2) ];
		this.setState({ center }, () => {
			this.drawBack(ctxBack);
			this.drawData(ctxData);
		})
	}

	drawBack(ctx){
		let { center } = this.state;
		let { width , height , innerRadius , outRadius , startAngle , endAngle , direction , invalidAreaBg , scale } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		/*设置中心点为原点*/
		_setDashBoardCenter(ctx, center);
		/*绘制背景*/
		_drawDashBoardBack(ctx, { outRadius , innerRadius , invalidAreaBg , startAngle , endAngle , direction });
		/*绘制刻度*/
		_drawDashBoardScale(ctx, { innerRadius , startAngle , endAngle , direction , ...scale });
		/*重置原点位置 方便清除canvas*/
		_setDashBoardCenter(ctx, [-center[0], -center[1]]);
	}

	drawData(ctx){
		let { center } = this.state;
		let { width , height , startAngle , endAngle , direction , centerDot , scale , pointer , dataNum } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		/*设置中心点为原点*/
		_setDashBoardCenter(ctx, center);
		/*绘制仪表盘数据指示线*/
		_drawDashBoardDataLine(ctx, { startAngle , endAngle , direction , ...pointer , dataNum , max : scale.max });
		/*绘制中心点*/
		_drawDashBoardCenterDot(ctx, centerDot);
		/*重置原点位置 方便清除canvas*/
		_setDashBoardCenter(ctx, [-center[0], -center[1]]);
	}

	render(){
		let { canvasId } = this.state;
		let { width , height , coordinate } = this.state.props;
		return(
			<div className = { styles.dashboard_all } style = {{ width , height }}>
				{ canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = { styles.dashboard_canvas }></canvas>) }
			</div>
		)
	}
}

DashBoard.defaultProps = {
	width : 450,					//canvas的宽度
	height : 450,					//canvas的高度
	innerRadius : 110,				//内半径
	outRadius : 120,				//外半径
	startAngle : 10/12 * Math.PI,	//起始角度(与canvas中arc一致)
	endAngle : 2/12 * Math.PI,		//结束角度(与canvas中arc一致)
	direction : false,				//false顺时针方向 true逆时针方向
	invalidAreaBg : '#5d9cec',			//无效区背景色
	centerDot : { radius : 5, stroke : false , fill : true , strokeStyle : '#5d9' , fillStyle : '#5d9' , lineWidth : 3 },		//中心点属性
	scale : { gap : 15 , num : 10 , max : 30 , font : '12px Arail' },	//刻度线属性
	pointer : { length : 70 , strokeStyle : 'pink' , lineWidth : 4 },	//指示线属性
	dataNum : 5,					//当前数据
}

export default DashBoard;
