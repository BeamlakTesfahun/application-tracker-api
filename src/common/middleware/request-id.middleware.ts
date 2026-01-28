import { Injectable, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const headerId = req.headers['x-request-id']
        const requestId =
            typeof headerId === 'string' && headerId.trim()
                ? headerId
                : randomUUID()

        // attach to request
        ;(req as any).requestId = requestId

        // return it to client so frontend can log it too
        res.setHeader('x-request-id', requestId)

        next()
    }
}
