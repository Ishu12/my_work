
module.exports = {
	seterror:function (ERR_TYPE, ERR_CODE, ERR_MSG){

		var error = {
					"error_type":ERR_TYPE,
					"error_code":ERR_CODE,
					"error_msg":ERR_MSG
		};

		return error;
	}
};