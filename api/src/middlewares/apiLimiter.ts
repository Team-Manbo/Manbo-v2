import rateLimit from 'express-rate-limit'

const apiLimiter = (windowMs: number, max: number) => rateLimit({
    windowMs: windowMs,
    max: max,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
        res.status(this.statusCode as number).json({
            code: this.statusCode,
            message: "Rate Limited"
        })
    }
})

export {apiLimiter}