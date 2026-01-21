import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { ApplicationsModule } from './applications/applications.module'
import { EventsModule } from './events/events.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        OrganizationsModule,
        ApplicationsModule,
        EventsModule,
    ],
})
export class AppModule {}
