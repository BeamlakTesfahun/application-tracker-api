import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) {}

    private async assertApplicationOwnership(
        userId: string,
        applicationId: string
    ) {
        const app = await this.prisma.application.findUnique({
            where: { id: applicationId },
            select: { id: true, userId: true },
        })

        if (!app) throw new NotFoundException('Application not found')
        if (app.userId !== userId) throw new ForbiddenException('Access denied')

        return app
    }

    private async assertEventOwnership(userId: string, eventId: string) {
        const event = await this.prisma.applicationEvent.findUnique({
            where: { id: eventId },
            include: { application: { select: { userId: true } } },
        })

        if (!event) throw new NotFoundException('Event not found')
        if (event.application.userId !== userId)
            throw new ForbiddenException('Access denied')

        return event
    }

    async create(userId: string, applicationId: string, dto: CreateEventDto) {
        await this.assertApplicationOwnership(userId, applicationId)

        const event = await this.prisma.applicationEvent.create({
            data: {
                applicationId,
                type: dto.type,
                title: dto.title,
                scheduledAt: dto.scheduledAt
                    ? new Date(dto.scheduledAt)
                    : undefined,
                notes: dto.notes,
                remindAt: dto.remindAt ? new Date(dto.remindAt) : undefined,
            },
        })

        // Optional: bump application.lastActivityAt whenever an event is added
        await this.prisma.application.update({
            where: { id: applicationId },
            data: { lastActivityAt: new Date() },
        })

        return event
    }

    async listForApplication(userId: string, applicationId: string) {
        await this.assertApplicationOwnership(userId, applicationId)

        return this.prisma.applicationEvent.findMany({
            where: { applicationId },
            orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
        })
    }

    async update(userId: string, eventId: string, dto: UpdateEventDto) {
        const event = await this.assertEventOwnership(userId, eventId)

        const updated = await this.prisma.applicationEvent.update({
            where: { id: eventId },
            data: {
                type: dto.type,
                title: dto.title,
                scheduledAt: dto.scheduledAt
                    ? new Date(dto.scheduledAt)
                    : undefined,
                notes: dto.notes,
                completedAt:
                    dto.completedAt === null
                        ? null
                        : dto.completedAt
                        ? new Date(dto.completedAt)
                        : undefined,
                remindAt: dto.remindAt ? new Date(dto.remindAt) : undefined,
                reminderSentAt: dto.remindAt ? null : undefined,
            },
        })

        await this.prisma.application.update({
            where: { id: event.applicationId },
            data: { lastActivityAt: new Date() },
        })

        return updated
    }

    async markCompleteNow(userId: string, eventId: string) {
        const event = await this.assertEventOwnership(userId, eventId)

        const updated = await this.prisma.applicationEvent.update({
            where: { id: eventId },
            data: { completedAt: new Date() },
        })

        await this.prisma.application.update({
            where: { id: event.applicationId },
            data: { lastActivityAt: new Date() },
        })

        return updated
    }

    async remove(userId: string, eventId: string) {
        const event = await this.assertEventOwnership(userId, eventId)

        await this.prisma.applicationEvent.delete({ where: { id: eventId } })

        await this.prisma.application.update({
            where: { id: event.applicationId },
            data: { lastActivityAt: new Date() },
        })

        return { success: true }
    }
}
