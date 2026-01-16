import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrganizationDto } from './dto/create-organization.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'

@Injectable()
export class OrganizationsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateOrganizationDto) {
        return this.prisma.organization.create({
            data: { ...dto, userId },
        })
    }

    async findAll(userId: string) {
        return this.prisma.organization.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        })
    }

    async findOne(userId: string, id: string) {
        const org = await this.prisma.organization.findUnique({ where: { id } })
        if (!org) throw new NotFoundException('Organization not found')
        if (org.userId !== userId) throw new ForbiddenException('Access denied')
        return org
    }

    async update(userId: string, id: string, dto: UpdateOrganizationDto) {
        await this.findOne(userId, id)
        return this.prisma.organization.update({
            where: { id },
            data: dto,
        })
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id)
        await this.prisma.organization.delete({ where: { id } })
        return { success: true }
    }
}
