import { Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { ApplicationsModule } from './applications/applications.module'
import { EventsModule } from './events/events.module'
import { MiddlewareConsumer } from '@nestjs/common/interfaces/middleware/middleware-consumer.interface'
import { RequestIdMiddleware } from './common/middleware/request-id.middleware'
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { LoggingThrottlerGuard } from './common/guards/logging-throttle-guard'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        OrganizationsModule,
        ApplicationsModule,
        EventsModule,
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 10, // seconds
                limit: 2, // default limit for all routes
            },
        ]),
    ],
    providers: [
        { provide: APP_GUARD, useClass: LoggingThrottlerGuard }, // enables throttling globally
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestIdMiddleware, HttpLoggerMiddleware).forRoutes('*')
    }
}
