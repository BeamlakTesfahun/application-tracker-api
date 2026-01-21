import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateApplicationDto) {
        // Ensure organization belongs to user
        const org = await this.prisma.organization.findUnique({
            where: { id: dto.organizationId },
        })
        if (!org) throw new NotFoundException('Organization not found')
        if (org.userId !== userId) throw new ForbiddenException('Access denied')

        return this.prisma.application.create({
            data: {
                userId,
                organizationId: dto.organizationId,
                title: dto.title,
                status: dto.status,
                appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
                lastActivityAt: dto.lastActivityAt
                    ? new Date(dto.lastActivityAt)
                    : undefined,
                sourceUrl: dto.sourceUrl,
                notes: dto.notes,
            },
        })
    }

    async findAll(
        userId: string,
        filters?: { organizationId?: string; status?: string }
    ) {
        return this.prisma.application.findMany({
            where: {
                userId,
                organizationId: filters?.organizationId,
                status: filters?.status as any,
            },
            orderBy: { updatedAt: 'desc' },
            include: { organization: true },
        })
    }

    async findOne(userId: string, id: string) {
        const app = await this.prisma.application.findUnique({
            where: { id },
            include: { organization: true },
        })
        if (!app) throw new NotFoundException('Application not found')
        if (app.userId !== userId) throw new ForbiddenException('Access denied')
        return app
    }

    async update(userId: string, id: string, dto: UpdateApplicationDto) {
        await this.findOne(userId, id)

        return this.prisma.application.update({
            where: { id },
            data: {
                organizationId: dto.organizationId,
                title: dto.title,
                status: dto.status as any,
                appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
                lastActivityAt: dto.lastActivityAt
                    ? new Date(dto.lastActivityAt)
                    : undefined,
                sourceUrl: dto.sourceUrl,
                notes: dto.notes,
            },
        })
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id)
        await this.prisma.application.delete({ where: { id } })
        return { success: true }
    }
}
