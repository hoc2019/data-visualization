import React from 'react';
import { _getRate , _getMax } from '../../utils/calc.js';
import { _isExist, _deepCopy } from '../../utils/validator.js';
import { _getCtx, _drawRadar } from '../../utils/canvas.js';
import './radar.less';

const obj = _drawRadar();
const _setRadarCenter = obj._setRadarCenter.bind(obj);
const _drawRadarCenterDot = obj._drawRadarCenterDot.bind(obj);
const _drawRadarScale = obj._drawRadarScale.bind(obj);
const _drawRadarLabel = obj._drawRadarLabel.bind(obj);
const _drawRadarGuide = obj._drawRadarGuide.bind(obj);
const _drawRadarData = obj._drawRadarData.bind(obj);

/**
 * 雷达图
 * 2个canvas 1个绘制背景 1个绘制数据
 */
class Radar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			canvasId : ['back'],
			lengthLimit : 3,			//雷达图数据长度限制
			tooltipPro : {},
			center : [],				//canvas中心位置坐标
			props : {},
			formatData : [],			//深拷贝的数据
		}
	}

	//组件完全受控，将props存入state的props对象中
	componentDidMount(){
		this.setState({ props : this.props , formatData : _deepCopy(this.props.data) }, () => this.init());
	}

	//组件完全受控，将props存入state的props对象中
	componentWillReceiveProps(nextProps){
		this.setState({ props : nextProps , formatData : _deepCopy(nextProps.data) }, () => this.init())
	}

	init(flag){
		let { canvasId } = this.state;
		let { width , height } = this.state.props;
		let ctx = _getCtx.call(this, canvasId[0]);
		let center = [ Math.round(width/2), Math.round(height/2) ];
		//设置canvas中心位置
		this.setState({ center }, () => {
			this.drawRadar(ctx ,flag);
			this.drawTooltip(ctx);
		});
	}

	drawRadar(ctx){
		let { lengthLimit , center , formatData } = this.state;
		let { width , height , radius , centerDot , scale , label , guide , dataRender } = this.state.props;
		ctx.clearRect(0, 0, width, height);
		if(formatData && formatData.length >= lengthLimit){
			//设置雷达图原点(必须第一个设置)
			_setRadarCenter(ctx, center);
			//绘制雷达图指示线
			_drawRadarGuide(ctx, { ...guide, data : formatData , radius });
			//绘制雷达图刻度线
			_drawRadarScale(ctx, { ...scale, data : formatData , radius , dataKey : dataRender.dataKey });
			//绘制雷达图文案
			_drawRadarLabel(ctx, { ...label, data : formatData , radius });
			//绘制雷达图圆心点
			_drawRadarCenterDot(ctx, { ...centerDot });
			//绘制雷达图数据
			_drawRadarData(ctx, { ...dataRender, data : formatData , radius });
			//重置雷达图原点(方便清除)
			_setRadarCenter(ctx, center = [-center[0], -center[1]]);
		}
	}

	//绘制数据含义工具栏
	drawTooltip(ctx){
		let { tooltipPro } = this.state;
		let { width , tooltip , dataRender } = this.state.props;
		let { position , childLineHeight , childLineWidth , height , disabledColor } = tooltip;
		let { stroke , fill , strokeStyle , fillStyle , dataKey , dataLabel } = dataRender;
		if(!tooltipPro.key || tooltipPro.key.length === 0){
			tooltipPro.key = [];
			for(let i = 0 ; i < dataKey.length ; i++){
				tooltipPro.key.push({ show : true , key : dataKey[i] , label : dataLabel[i] || dataKey[i] });
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
			<div className = { 'radar_tooltip' } style = { style }>
				{ tooltipPro.key.map((item, index) => (
					<div key = { item.key } onClick = {() => this.changeData(item.key)}>
						<div style = {{
							height : childLineHeight,
							width : childLineWidth,
							marginRight : 5,
							background : item.show && fill ? fillStyle[index % fillStyle.length] : '#fff',
							border : item.show && stroke ? `1px solid ${strokeStyle[index % strokeStyle.length]}` : disabledColor,
						}}></div>
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
		let { canvasId , tooltipPro } = this.state;
		let { width , height } = this.state.props;
		return(
			<div className = { 'radar_all' } style = {{ width , height }}>
				 { canvasId && canvasId.map((item,index) => <canvas key = { item } ref = { item } width = { width } height = { height } className = { 'radar_canvas' }></canvas>) }
				 { tooltipPro.node }
			</div>
		)
	}
}

Radar.defaultProps = {
	width : 450,				//canvas的宽度
	height : 450,				//canvas的高度
	radius : 130,				//雷达图的半径
	centerDot : { radius : 5 , fill : true , fillStyle : '#5d9'  , stroke : false , strokeStyle : '#5d9cec' },
	scale : {
		lineWidth : 2,			//雷达图刻度线宽
		strokeStyle : '#5d9',	//雷达图刻度线颜色
		scaleNum : 4,			//雷达图内含环数
//		setLineDash : [4, 4]	//雷达图刻度线虚线指标
	},
	guide : {
		show : true,			//是否绘制指示线
		setLineDash : [4, 4],	//指示线参数[长度，间隔]
		lineWidth : 2,			//指示线宽度
		strokeStyle : '#ddd',	//指示线线颜色
	},
	label : {
		labelKey : 'label',						//需要渲染的名称键名 对应data种需要渲染的名称
		fillStyle : ['red','green','blue'],		//自定义需要渲染的颜色的键名 对应data中渲染的颜色
		textGap : 20,							//文案和图的间距
		font : '16px Arial',					//文案默认字体大小和字体种类
	},
	dataRender : {
//		stroke : true,
		strokeStyle : ['#5d9','#5d9cec','#ff0000'],
//		setLineDash : [4, 4],	//虚线参数[长度，间隔]
		fill : true,
		fillStyle : ['rgba(85,221,153,.5)','rgba(93,156,236,.5)','rgba(255,0,0,.5)'],
		lineWidth : 2,			//边框宽度
		dataKey : ['A', 'B', 'C'],
		dataLabel : ['stuA','stuB','stuC']
	},
	title : { position : 'top' , label : '成绩图（α测试）' , style : { fontSize : 16 , color : '#000' , height : 60 } },
	tooltip : { position : 'bottom' , childLineHeight : 20 , childLineWidth : 30 , height : 60 , disabledColor : '#ddd' },	//工具提示
	data : [{
		label : '语文' , A : 120 , B : 90 , C : 130
	},{
		label : '数学' , A : 140 , B : 150 , C : 130
	},{
		label : '英语' , A : 130 , B : 90 , C : 150
	},{
		label : '历史' , A : 50 , B : 80 , C : 60
	},{
		label : '政治' , A : 90 , B : 60 , C : 100
	},{
		label : '地理' , A : 80 , B : 75 , C : 100
	},{
		label : '物理' , A : 100 , B : 80 , C : 100
	},{
		label : '化学' , A : 95 , B : 60 , C : 100
	},{
		label : '生物' , A : 90 , B : 75 , C : 100
	}]							//展示数据
}

export default Radar;
