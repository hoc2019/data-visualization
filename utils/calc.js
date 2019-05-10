import { _isExist } from './validator.js';

/**
 * 计算比例，如果是非数字或者负数，则计为0
 * @params num 有效值
 * @parmas max 最大值
 * @return 比例
 */
export function _getRate(num = 0, max = 0){
	return (_isExist(num, max) && num >= 0 && max > 0 ? num/max : 0)
}

/**
 * 获取一个数组中的最大值 返回最大的num
 * @parmas array 需要比对的数组 类似[{id:1,key:1},{id:2,key:2}]
 * @parmas key
 */
export function _getMax(array = [], key = 'key'){
	let arr = [];
	array.map((item, i) => {
		//这里需要判断是否为数字再push，否则在判断最大值的时候无法判断
		!isNaN(item[key]) && arr.push(item[key]);
	});
	return arr.length > 0 ? Math.max.apply(null, arr) : 0;
}
