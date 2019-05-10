/**
 * 校验输入是否为有效值
 */
export function _isExist(param){
	let args = arguments;
	for(let i = 0 ; i < args.length ; i++){
		let item = args[i];
		if(item === '' || item === undefined || item === null){
			return false;
		}
	}
	return true;
}
