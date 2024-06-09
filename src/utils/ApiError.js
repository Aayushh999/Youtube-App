class ApiError extends Error {
    constructor(
        statusCode,
        message = "Unknown Error",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null                   // read more
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}