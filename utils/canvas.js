import { _getMax , _getRate } from './calc.js';
import { _isExist , _isSetLineDash } from './validator.js';

/**
 * 获取canvas的上下文
 * @params id canvas的id
 * @params type canvas渲染类型
 * @return ctx canvas的的上下文ctx
 */
export function _getCtx(id, type = '2d'){
	return _isExist(id) && this.refs[id] && this.refs[id].getContext(type);
}

/**
 * 绘制笛卡尔坐标轴基类
 */
function DrawCartCoor(){
	let defaultBegin = [0, 0];
	let defaultEnd = [100,100];
	/*判断是否在绘制x或y轴(水平或竖直的坐标轴)*/
	function isDrawCoor(begin = defaultBegin, end = defaultEnd){
		let drawX = begin[0] !== end[0] && begin[1] === end[1];		//true时表示在绘制水平x轴
		let drawY = begin[0] === end[0] && begin[1] !== end[1]; 	//true时表示在绘制竖直y轴
		return { drawX , drawY , flag : drawX || drawY };
	}
	/**
	 * 绘制坐标轴
	 * @parmas ctx canvas的上下文
	 * @params props 坐标线的属性
	 *  show 是否绘制该刻度线
	 *  begin 初始canvas坐标点
	 * 	end 结束canvas坐标点
	 * 	strokeStyle 线条颜色
	 *  lineWidth 线条宽度
	 *  lineCap 轴线链接属性
	 *  setLineDash 虚线属性
	 */
	this._drawCoor = function(ctx, props = {}){
		let { show , begin = defaultBegin, end = defaultEnd, strokeStyle = '#000' , lineWidth = 2 , lineCap = 'round' , setLineDash } = props;
		let { flag } = isDrawCoor(begin, end);
		if(show && flag){
			ctx.save();
			ctx.beginPath();
			//指定绘制虚线时
			_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
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
	 *  strokeStyle 刻度线颜色
	 * 	scaleNum 刻度线数量(0不显示刻度线)
	 *  scaleLength 刻度线长度(可通过正负调节刻度线显示方向，0不显示刻度线)
	 */
	this._drawScale = function(ctx, props = {}){
		let { begin = defaultBegin, end = defaultEnd, strokeStyle = '#000', scaleNum = 5, scaleLength = 0, lineWidth = 2 , startIndex = 0 , endIndex = scaleNum } = props;
		let { drawX , drawY , flag } = isDrawCoor(begin, end);
		//绘制x轴或者y轴 并且刻度线数量大于0时 绘制刻度线
		if(flag && scaleNum > 0){
			//有{scaleNum}条刻度线，则该坐标轴被分为了{scaleNum-1}块区域
			let xLength = (end[0]-begin[0])/(scaleNum-1);			//每块区域x轴的长度
			let yLength = (end[1]-begin[1])/(scaleNum-1);			//每块区域y轴的长度
			let cx, cy, ex, ey;										//起始x 起始y 结束x 结束y
			ctx.save();
			for(let i = startIndex ; i < endIndex ; i++){
				cx = begin[0]+xLength*i;
				cy = begin[1]+yLength*i;
				ex = cx + (drawY ? scaleLength : 0);				//如果是绘制y轴刻度线，绘制时x坐标要变化
				ey = cy + (drawX ? scaleLength : 0);				//如果是绘制x轴刻度线，绘制时y坐标要变化
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(ex, ey);
				ctx.lineWidth = lineWidth;
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
	 *  strokeStyle 指示线颜色
	 *  setLineDash 指示线虚线属性
	 *  gridLength 指示线长度
	 */
	this._drawGrid = function(ctx, props = {}){
		let { begin = defaultBegin , end = defaultEnd , show , gridNum = 5 , strokeStyle = '#000' , lineWidth = 1, setLineDash = [4, 4] , gridLength } = props;
		let { drawX , drawY , flag } = isDrawCoor(begin, end);
		//绘制x轴或者y轴 并且指示线数量大于0时 绘制指示线
		if(show && flag && gridNum > 0){
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
				_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
				ctx.moveTo(cx, cy);
				ctx.lineTo(ex, ey);
				ctx.lineWidth = lineWidth;
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
	 *  key 需要绘制文案的键名字符串或数组
	 *  key 需要绘制文案的键值字符串或数组
	 *  labelNum 需要绘制的文案个数
	 *  begin 起始点坐标数组
	 *  end 结束点坐标数组
	 *  data 数据
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
	/**
	 * 鼠标悬浮绘制具体数据提示
	 * @parmas ctx 绘制canvas的上下文
	 * @params props 其他参数对象
	 *  width 文案块宽度
	 *  height 文案块高度
	 *  setLineDash 指示线是否虚线属性
	 *  canvasW canvas的宽度
	 *  canvasH canvas的高度
	 *  xCoor x坐标轴的位置属性
	 *  yCoor y坐标轴的位置属性
	 *  data 数据
	 *  scale 当前鼠标的坐标(外部传入最好取offsetX和offSetY 与canvas坐标系对应)
	 */
	this._drawDataBlock = function(ctx, props = {}){
		let { rectWidth , rectHeight , lineWidth , setLineDash , canvasW, canvasH, xCoor, yCoor, data = [], scale } = props;
		let dataLength = data.length;
		let xLength = (xCoor.end[0] - xCoor.begin[0])/(dataLength-1);		//每一块x轴的长度
		ctx.save();
		ctx.clearRect(0, 0, canvasW, canvasH);
		for(let i = 0 ; i < data.length ; i++){
			let x = xCoor.begin[0] + xLength * i;
			if(Math.abs(scale[0] - x) < Math.abs(xLength)/2){
				ctx.save();
				ctx.beginPath();
				_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
				ctx.moveTo(x, xCoor.begin[1]);
				ctx.lineTo(x, yCoor.end[1]);
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = '#000';
				ctx.stroke();
				ctx.restore();

				ctx.beginPath();
				ctx.strokeRect(x+5, (yCoor.end[1] - yCoor.begin[1])/2 + yCoor.begin[1], rectWidth, rectHeight);
				ctx.stroke();

				break;
			}
		}
		ctx.restore();
	}
}

/**
 * 绘制极坐标系基类
 */
function DrawPolarCoor(){
	/**
	 * 绘制极坐标原点并且
	 * @params ctx canvas上下文
	 * @params props 属性
	 *  radius 圆心点半径
	 *  fill 是否有填充色
	 *  fillStyle 填充色色值
	 *  stroke 是否有边框色
	 *  strokeStyle 边框色色值
	 *  center 中心点坐标
	 */
	this._setCenter = function(ctx, center){
		ctx.translate.apply(ctx, center);
	}
	this._drawCenterDot = function(ctx, props = {}){
		let { radius = 3 , fill , stroke , fillStyle , strokeStyle } = props;
		ctx.save();
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, 2 * Math.PI);
		if(fill){
			ctx.fillStyle = fillStyle;
			ctx.fill();
		}
		if(stroke){
			ctx.strokeStyle = strokeStyle;
			ctx.stroke();
		}
		ctx.closePath();
		ctx.restore();
	}
	this._drawLabel = function(ctx, props = {}){
		let { fillStyle , textGap , font , radius , label , rad , index } = props;
		//js计算偏差，这里四舍五入
		let cx = Math.round(radius * Math.sin(rad * index));
		let cy = -Math.round(radius * Math.cos(rad * index));		//由于笛卡尔坐标和canvas坐标y轴方向相反
		//计算文案的位置
		if(cx > 0){ cx += textGap }else if(cx < 0){ cx -= textGap }
		if(cy > 0){ cy += textGap }else if(cy < 0){ cy -= textGap }
		ctx.font = font;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if(Array.isArray(fillStyle) && fillStyle.length > 0 ){
			ctx.fillStyle = fillStyle[index % fillStyle.length];
		}
		ctx.fillText(label, cx, cy);
	}
}

/**
 * 绘制折线图构造函数
 * 继承笛卡尔坐标系基类
 */
class DrawLine extends DrawCartCoor{
	constructor(props){
		super(props);
	}
	/*绘制折线图坐标轴*/
	_drawLineCoor(){ this._drawCoor(...arguments) }
	/*绘制折线图刻度线*/
	_drawLineScale(){ this._drawScale(...arguments) }
	/*绘制折线图指示线*/
	_drawLineGrid(){ this._drawGrid(...arguments) }
	/*绘制折线图坐标文案*/
	_drawLineLabel(){ this._drawLabel(...arguments) }
	/*鼠标悬浮绘制具体数据提示*/
	_drawLineDataBlock(){ this._drawDataBlock(...arguments) }
	/**
	 * 绘制数值线
	 * @params ctx canvas上下文
	 * @parmas props 相应属性
	 *  data 数据
	 *  key 数据键名字符串或数组
	 *  xCoor x坐标轴属性对象
	 *  tCoor y坐标轴属性对象
	 *  lineWidth 数值线宽
	 *  line 是否绘制数值线
	 *  dot 是否绘制拐点
	 *  dotRadius 拐点半径
	 */
	_drawLineData(ctx, props = {}){
		let { data = [], key = [], xCoor, yCoor , strokeStyle = [] , lineWidth = 3 , line = true , dot = true , dotRadius = 4 } = props;
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
		line && key.map((keyItem, keyIndex) => {
			ctx.beginPath();
			data.map((dataItem, dataIndex) => {
				if(dataItem[keyItem] >= 0){
					let item = dataItem[keyItem];
					cx = xCoor.begin[0] + xLength * dataIndex;
					cy = _getRate(item, max) * yLength + yCoor.begin[1];			//比例 * y轴长度 + y起始坐标 => 转化为笛卡尔坐标系的y轴坐标
					dataIndex === 0 && ctx.moveTo(cx, cy);							//如果初次绘制，则移动到该点
					dataIndex > 0 && ctx.lineTo(cx, cy);							//其余状态开始连线
				}
			})
			ctx.strokeStyle = strokeStyle[keyIndex % strokeStyle.length];
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		})
		//绘制拐点
		dot && key.map((keyItem, keyIndex) => {
			data.map((dataItem, dataIndex) => {
				if(dataItem[keyItem] >= 0){
					let item = dataItem[keyItem];
					cx = xCoor.begin[0] + xLength * dataIndex;
					cy = _getRate(item, max) * yLength + yCoor.begin[1];			//比例 * y轴长度 + y起始坐标 => 转化为笛卡尔坐标系的y轴坐标
					ctx.beginPath();
					ctx.arc(cx, cy, dotRadius, 0, 2 * Math.PI);
					ctx.fillStyle = strokeStyle[keyIndex % strokeStyle.length];
					ctx.fill();
				}
			})
		})
	}
}

/**
 * 绘制雷达图构造函数
 * 继承极坐标系基类
 */
class DrawRadar extends DrawPolarCoor{
	constructor(props){
		super(props);
	}
	/*获取数据点坐标*/
	_getDataDotPos(props, callback){
		let { data , length } = props;
		let rad = Math.PI * 2 / data.length;
		let cx, cy;
		data.map((dataItem, dataIndex) => {
			cx = length * Math.sin(rad * dataIndex);
			cy = -length * Math.cos(rad * dataIndex);
			typeof callback === 'function' && callback([cx, cy], dataItem, dataIndex);
		})
	}
	/*设置雷达图原点*/
	_setRadarCenter(){
		this._setCenter(...arguments)
	}
	/*绘制雷达图原点*/
	_drawRadarCenterDot(){ this._drawCenterDot(...arguments) }
	/*绘制雷达图文案*/
	_drawRadarLabel(ctx, props = {}){
		let { labelKey , data } = props;
		let rad = Math.PI * 2 / data.length;		//数据之间的弧度
		ctx.save();
		//格式化数据 label文案 rad弧度
		data.map((item, index) => {
			this._drawLabel(ctx, { ...props, label : item[labelKey] || '' , rad , index })
		});
		ctx.restore();
	}
	/**
	 * 绘制雷达图刻度线
	 * @params ctx canvas上下文
	 * @params props 属性
	 *  lineWidth 刻度线宽
	 *  strokeStyle 刻度线颜色
	 *  scaleNum 刻度线数量
	 *  setLineDash 刻度线虚线属性
	 *  data 数据长度
	 *  radius 雷达图最外层半径
	 */
	_drawRadarScale(ctx, props = {}){
		let { lineWidth , strokeStyle , scaleNum , setLineDash , data , radius , dataKey } = props;
		let ρ = !isNaN(radius/scaleNum) ? radius/scaleNum : 20;		//每个刻度之间的间距(极坐标的ρ)
		let cx, cy, length, num;
		let max = 0;
		//获取最大值
		for(let i = 0 ; i < dataKey.length ; i++){
			max = Math.max(max, _getMax(data, dataKey[i]));
		}
		ctx.save();
		for(let scaleIndex = 0 ; scaleIndex < scaleNum ; scaleIndex++){
			length = ρ * (scaleIndex + 1);
			num = Math.round((max/scaleNum) * (scaleIndex + 1));
			ctx.beginPath();
			this._getDataDotPos({ data , length }, (pos, item, index) => {
				index === 0 && ctx.moveTo.apply(ctx, pos);
				index === 0 && ctx.fillText(num, ...pos);
				index > 0 && ctx.lineTo.apply(ctx, pos);
			});
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle;
			_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
			ctx.closePath();
			ctx.stroke();
		}
		ctx.restore();
	}
	/*绘制雷达图指示线*/
	_drawRadarGuide(ctx, props = {}){
		let { show , setLineDash , lineWidth , strokeStyle , data , radius } = props;
		ctx.save();
		ctx.beginPath();
		show && this._getDataDotPos({ data , length : radius }, (pos) => {
			ctx.moveTo(0, 0);
			ctx.lineTo.apply(ctx, pos);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle;
			_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
			ctx.stroke();
		});
		ctx.restore();
	}
	/*绘制雷达图数据*/
	_drawRadarData(ctx, props = {}){
		let { stroke , fill , strokeStyle , fillStyle , setLineDash , lineWidth , dataKey , data , radius } = props;
		let max = 0;
		//获取最大值
		for(let i = 0 ; i < dataKey.length ; i++){
			max = Math.max(max, _getMax(data, dataKey[i]));
		}
		ctx.save();
		dataKey.map((dataKeyItem, dataKeyIndex) => {
			ctx.beginPath();
			this._getDataDotPos({ data , length : radius }, (pos, item, index) => {
				let rate = _getRate(item[dataKeyItem], max);
				let ratePos = pos.map((posItem) => posItem * rate);
				index === 0 && ctx.moveTo.apply(ctx, ratePos);
				index > 0 && ctx.lineTo.apply(ctx, ratePos);
				ctx.lineWidth = lineWidth;
				_isSetLineDash(setLineDash, (pos) => { ctx.setLineDash(pos) });
				if(stroke){ ctx.strokeStyle = strokeStyle[dataKeyIndex % strokeStyle.length] }
				if(fill){ ctx.fillStyle = fillStyle[dataKeyIndex % fillStyle.length] }
			});
			ctx.closePath();
			stroke && ctx.stroke();
			fill && ctx.fill();
		});
		ctx.restore();
	}
}

/*绘制折线图方法*/
export function _drawLine(){
	return new DrawLine();
}

/*绘制雷达图方法*/
export function _drawRadar(){
	return new DrawRadar();
}










