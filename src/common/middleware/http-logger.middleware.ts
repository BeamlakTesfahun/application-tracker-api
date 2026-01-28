import { Injectable, NestMiddleware } from '@nestjs/common'
import pinoHttp from 'pino-http'
import { Request, Response, NextFunction } from 'express'

const isProd = process.env.NODE_ENV === 'production'

const logger = pinoHttp({
    transport: isProd
        ? undefined
        : {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
          },
    customProps: (req: Request) => ({
        requestId: (req as any).requestId,
    }),
    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                requestId: (req as any).requestId,
            }
        },
    },
})

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        logger(req, res)
        next()
    }
}
