import { _getMax , _getRate } from './calc.js';
import { _isExist } from './validator.js';

/**
 * 获取canvas的上下文
 * @params id canvas的id
 * @params type canvas渲染类型
 * @return ctx canvas的的上下文ctx
 */
export function _getCtx(id, type = '2d'){
	return _isExist(id) && this.refs[id] && this.refs[id].getContext(type);
}

/*绘制坐标轴信息构造函数*/
function DrawCoordinate(){
	let defaultBegin = [0, 0];
	let defaultEnd = [100,100];
	//判断是否在绘制x或y轴(x或y轴必须是水平或者竖直)
	function isDrawCoor(begin = defaultBegin, end = defaultEnd){
		let drawX = begin[0] !== end[0] && begin[1] === end[1];		//true时表示在绘制水平x轴
		let drawY = begin[0] === end[0] && begin[1] !== end[1]; 	//true时表示在绘制竖直y轴
		return { drawX , drawY , flag : drawX || drawY };
	}
	/**
	 * 绘制坐标轴
	 * @parmas ctx canvas的上下文
	 * @params props 坐标线的属性
	 *  begin 初始canvas坐标点
	 * 	end 结束canvas坐标点
	 * 	strokeStyle 线条颜色
	 *  lineWidth 线条宽度
	 */
	this._drawCoor = function(ctx, props = {}){
		let { show , begin = defaultBegin, end = defaultEnd, strokeStyle = '#000' , lineWidth = 3 , lineCap = 'round' , setLineDash } = props;
		let { flag } = isDrawCoor(begin, end);
		//显示该坐标轴线
		if(show && flag){
			ctx.save();
			ctx.beginPath();
			//指定绘制虚线时
			Array.isArray(setLineDash) && setLineDash.length === 2 && ctx.setLineDash(setLineDash);
			ctx.moveTo.apply(ctx, begin);
			ctx.lineTo.apply(ctx, end);
			ctx.strokeStyle = strokeStyle;
			ctx.lineWidth = lineWidth;
			ctx.lineCap = lineCap;
			ctx.stroke();
			ctx.restore();
		}
	}
	/**
	 * 绘制坐标轴刻度
	 * @parmas ctx canvas的上下文
	 * @params props 坐标刻度线属性
	 *  begin 初始canvas坐标点
	 * 	end 结束canvas坐标点
	 * 	scaleNum 刻度线数量(0不显示刻度线)
	 *  scaleLength 刻度线长度(可通过正负调节刻度线显示方向，0不显示刻度线)
	 */
	this._drawScale = function(ctx, props = {}){
		let { begin = defaultBegin, end = defaultEnd, strokeStyle = '#000' , scaleNum = 5, scaleLength = 0 } = props;
		let { drawX , drawY , flag } = isDrawCoor(begin, end);
		//绘制x轴或者y轴 并且刻度线数量大于0时 绘制刻度线
		if(flag && scaleNum > 0){
			//有{scaleNum}条刻度线，则该坐标轴被分为了{scaleNum-1}块区域
			let xLength = (end[0]-begin[0])/(scaleNum-1);			//每块区域x轴的长度
			let yLength = (end[1]-begin[1])/(scaleNum-1);			//每块区域y轴的长度
			let cx, cy, ex, ey;										//起始x 起始y 结束x 结束y
			ctx.save();
			for(let i = 0 ; i < scaleNum ; i++){
				cx = begin[0]+xLength*i;
				cy = begin[1]+yLength*i;
				ex = cx + (drawY ? scaleLength : 0);				//如果是绘制y轴刻度线，绘制时x坐标要变化
				ey = cy + (drawX ? scaleLength : 0);				//如果是绘制x轴刻度线，绘制时y坐标要变化
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(ex, ey);
				ctx.strokeStyle = strokeStyle;
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	/**
	 * 绘制指示线
	 * @parmas ctx canvas的上下文
	 * @params props 坐标指示线的属性
	 *  begin 初始canvas坐标点
	 * 	end 结束canvas坐标点
	 * 	gridNum 指示线数量(可通过正负调节刻度线显示方向，0不显示指示线)
	 */
	this._drawGrid = function(ctx, props = {}){
		let { begin = defaultBegin, end = defaultEnd, gridNum = 5 , strokeStyle = '#000' , setLineDash = [4, 4] , gridLength } = props;
		let { drawX , drawY , flag } = isDrawCoor(begin, end);
		//绘制x轴或者y轴 并且指示线数量大于0时 绘制指示线
		if(flag && gridNum > 0){
			//有{gridNum}条指示线，则该坐标轴被分为了{gridNum-1}块区域
			let xLength = (end[0]-begin[0])/(gridNum-1);			//每块区域x轴的长度
			let yLength = (end[1]-begin[1])/(gridNum-1);			//每块区域y轴的长度
			let cx, cy, ex, ey;										//起始x 起始y 结束x 结束y
			ctx.save();
			//从1开始是因为与x轴y轴重合的指示线不需要绘制
			for(let i = 1 ; i < gridNum ; i++){
				cx = begin[0]+xLength*i;
				cy = begin[1]+yLength*i;
				ex = cx + (drawY ? gridLength : 0);					//如果是绘制y轴指示线，绘制时x坐标要变化
				ey = cy + (drawX ? gridLength : 0);					//如果是绘制y轴指示线，绘制时x坐标要变化
				ctx.beginPath();
				//指定绘制虚线时
				Array.isArray(setLineDash) && setLineDash.length === 2 && ctx.setLineDash(setLineDash);
				ctx.moveTo(cx, cy);
				ctx.lineTo(ex, ey);
				ctx.strokeStyle = strokeStyle;
				ctx.stroke();
			}
			ctx.restore();
		}
	}
	/**
	 * 绘制坐标轴文案
	 * @parmas ctx canvas的上下文
	 * @params props 坐标刻度文案属性
	 */
	this._drawLabel = function(ctx, props = {}){
		let { key , label , labelNum = 2 , begin = defaultBegin , end = defaultEnd , data = [] } = props;
		let { drawX , drawY } = isDrawCoor(begin, end);
		let dataLength = data.length;
		let xLength, yLength, cx, cy, text;							//每一块x长度 每一块y长度 起始x 起始y 文案内容
		ctx.save();
		//绘制x轴文案和y轴文案需要区别处理
		if(drawX){
			//x轴文案个数等级数据长度
			xLength = (end[0]-begin[0])/(dataLength-1);			//每块区域x轴的长度
			yLength = (end[1]-begin[1])/(dataLength-1);			//每块区域y轴的长度
			for(let i = 0 ; i < dataLength ; i++){
				cx = begin[0]+xLength*i;
				cy = begin[1]+yLength*i;
				text = data[i][key];
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(!isNaN(text) ? Math.round(text) : text, cx, cy+5);
			}
			return;
		}
		if(drawY){
			//y轴文案个数{labelNum}可以自定义，最好与刻度线个数{scaleNum}和指示线个数{gridNum}相同
			let max = 0;
			let yNum = 0;
			let yLength = 0
			for(let i = 0 ; i < key.length ; i++){
				//取出所有y轴数据中的最大值
				max = Math.max(max, _getMax(data, key[i]));
			}
			//每一块的长度为max/(labelNum-1)
			yNum = max/(labelNum-1);
			xLength = (end[0]-begin[0])/(labelNum-1);
			yLength = (end[1]-begin[1])/(labelNum-1);
			text = 0;
			for(let i = 0 ; i < labelNum ; i++){
				cx = begin[0]+xLength*i;
				cy = begin[1]+yLength*i;
				ctx.textAlign = 'end';
				ctx.textBaseline = 'middle';
				ctx.fillText(!isNaN(text) ? Math.round(text) : text, cx-5, cy);
				text += yNum;
			}
			return;
		}
		ctx.restore();
	}
}

/**
 * 绘制折线图构造函数
 * 继承基本坐标轴信息构造函数
 */
class DrawLine extends DrawCoordinate{
	constructor(props){
		super(props);
	}
	//绘制数据
	_drawData(ctx, props = {}){
		let { data = [], key = [], xCoor, yCoor , strokeStyle = [] , lineWidth = 3 , dot = true } = props;
		let xLength = (xCoor.end[0] - xCoor.begin[0])/(data.length-1);			//x轴长度
		let yLength = yCoor.end[1] - yCoor.begin[1];							//y轴长度(为负数)
		let max = 0;
		let cx, cy, ex, ey;
		for(let i = 0 ; i < key.length ; i++){
			//取出所有y轴数据中的最大值
			max = Math.max(max, _getMax(data, key[i]));
		}
		//绘制数据时 是绘制完一种数据再绘制另一种 所以外层是key遍历 内层是data遍历
		//绘制折线
		key.map((keyItem, keyIndex) => {
			ctx.beginPath();
			data.map((dataItem, dataIndex) => {
				let item = dataItem[keyItem];
				cx = xCoor.begin[0] + xLength * dataIndex;
				cy = _getRate(item, max) * yLength + yCoor.begin[1];			//比例 * y轴长度 + y起始坐标 => 转化为笛卡尔坐标系的y轴坐标
				dataIndex === 0 && ctx.moveTo(cx, cy);							//如果初次绘制，则移动到该点
				dataIndex > 0 && ctx.lineTo(cx, cy);							//其余状态开始连线
			})
			ctx.strokeStyle = strokeStyle[keyIndex % strokeStyle.length];
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		})
		//允许显示拐点时 绘制拐点
		dot && key.map((keyItem, keyIndex) => {
			data.map((dataItem, dataIndex) => {
				let item = dataItem[keyItem];
				cx = xCoor.begin[0] + xLength * dataIndex;
				cy = _getRate(item, max) * yLength + yCoor.begin[1];			//比例 * y轴长度 + y起始坐标 => 转化为笛卡尔坐标系的y轴坐标
				ctx.beginPath();
				ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
				ctx.fillStyle = strokeStyle[keyIndex % strokeStyle.length];
				ctx.fill();
			})
		})
	}
}

/*绘制坐标系方法*/
export function _drawLine(){
	return new DrawLine();
}
















