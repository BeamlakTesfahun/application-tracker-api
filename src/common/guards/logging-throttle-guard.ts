import { Injectable, ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler'

@Injectable()
export class LoggingThrottlerGuard extends ThrottlerGuard {
    protected headerPrefix = 'X-RateLimit' // optional, matches yours

    async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        const {
            context,
            limit,
            ttl,
            throttler,
            blockDuration,
            getTracker,
            generateKey,
        } = requestProps
        const { req, res } = this.getRequestResponse(context)

        console.log(
            `ThrottlerGuard running for: ${req.method} ${req.url} | IP: ${req.ip}`,
        )
        const tracker = await getTracker(req, context)
        console.log(`   → Tracking key: ${tracker}`)

        const allowed = await super.handleRequest(requestProps)

        return allowed
    }
}
