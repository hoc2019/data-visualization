/**
 * 校验输入是否为有效值
 */
export function _isExist(){
	let args = arguments;
	for(let i = 0 ; i < args.length ; i++){
		let item = args[i];
		if(item === '' || item === undefined || item === null){
			return false;
		}
	}
	return true;
}

/**
 * 校验canvas是否渲染虚线
 */
export function _isSetLineDash(setLineDash, callback){
	Array.isArray(setLineDash) && setLineDash.length === 2 && typeof callback === 'function' && callback(setLineDash);
}

/**
 * 深拷贝方法
 */
export function _deepCopy(obj){
	let type = isType(obj)
	if (type === 'Array' || type === 'Object') {
		return cloneObj(obj)
	}else if(type === 'Date') {
		return obj.constructor(obj)
	}else{
		return obj
	}
}

function cloneObj(obj) {
	let newObj = obj instanceof Array ? [] : {};
	for (let key in obj) {
		newObj[key] = typeof obj[key] === 'object' ? cloneObj(obj[key]) : obj[key]
	}
	return newObj;
}

function isType(o) {
	return /\[object\s(.*?)\]/.exec(Object.prototype.toString.call(o))[1]
}
