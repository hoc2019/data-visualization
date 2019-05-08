//获取canvas的上下文
export function _getCtx(id){
	return this.refs[id] && this.refs[id].getContext('2d');
}

//获取当前值和最大值的比例，如果是非数字或者负数，则计为0
export function _getRate(num = 0, max = 0){
	return (!isNaN(num) && !isNaN(max) && num >= 0 && max >= 0 ? num/max : 0)
}

//获取一个数组中的最大值[{ id : 1 , key : 1 },{ id : 2 , key : 2 }]，返回最大的num
export function _getMax(array = [], key = 'key'){
	let arr = [];
	array.map((item, i) => {
		//这里需要判断是否为数字再push，否则在判断最大值的时候无法判断
		!isNaN(item[key]) && arr.push(item[key]);
	});
	return arr.length > 0 ? Math.max.apply(null, arr) : 0;
}
