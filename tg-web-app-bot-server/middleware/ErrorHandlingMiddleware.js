const ApiErrror = require('../error/ApiError.js')
const {message} = require("telegraf/filters");

module.exports = function (err,req, res, next) {
    if(err instanceof ApiErrror){
        res.status(err.status).json({message: err.message})
    }
    return res.status(500).json({message: "Server Error"})
}