import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard'
import { OrganizationsService } from './organizations.service'
import { CreateOrganizationDto } from './dto/create-organization.dto'
import { UpdateOrganizationDto } from './dto/update-organization.dto'

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
    constructor(private service: OrganizationsService) {}

    @Post()
    create(@Req() req: any, @Body() dto: CreateOrganizationDto) {
        return this.service.create(req.user.userId, dto)
    }

    @Get()
    findAll(@Req() req: any) {
        return this.service.findAll(req.user.userId)
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.userId, id)
    }

    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateOrganizationDto
    ) {
        return this.service.update(req.user.userId, id, dto)
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.userId, id)
    }
}
