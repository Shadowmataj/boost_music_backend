import {errorsDictionary} from "../config.js"

const errorsHandler = (error, req, res, next) => {
    let customError = errorsDictionary[0]
    if(error.type){
        for(const key in errorsDictionary){
            if(errorsDictionary[key].code === error.type.code) customError = errorsDictionary[key]
        }
        req.logger.warning(`${new Date().toDateString()} ${req.method} ${req.url} ${customError.message}`)
        return res.status(customError.status).send({ status: "ERROR", payload: "", error: customError.message})
    }
}

export default errorsHandler