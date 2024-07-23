import config, {errorsDictionary} from "../config.js"

const errorsHandler = (error, req, res, next) => {
    let customError = errorsDictionary[0]
    for(const key in errorsDictionary){
        if(errorsDictionary[key].code === error.type.code) customError = errorsDictionary[key]
    }
    return res.status(customError.status).send({ status: "ERROR", payload: "", error: customError.message})
}

export default errorsHandler