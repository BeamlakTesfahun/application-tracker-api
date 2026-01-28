import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
// import {
//     ApiTags,
//     ApiBearerAuth,
//     ApiOperation,
//     ApiResponse,
//     ApiOkResponse,
//     ApiCreatedResponse,
//     ApiNoContentResponse,
//     ApiBadRequestResponse,
//     ApiUnauthorizedResponse,
//     ApiForbiddenResponse,
//     ApiNotFoundResponse,
// } from '@nestjs/swagger',
// import { ApplicationResponseDto } from './dto/application-response.dto'

// @ApiTags('Applications')
// @ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
    constructor(private service: ApplicationsService) {}

    @Post()
    create(@Req() req: any, @Body() dto: CreateApplicationDto) {
        return this.service.create(req.user.userId, dto)
    }

    @Get()
    findAll(
        @Req() req: any,
        @Query('organizationId') organizationId?: string,
        @Query('status') status?: string,
    ) {
        return this.service.findAll(req.user.userId, { organizationId, status })
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.service.findOne(req.user.userId, id)
    }

    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateApplicationDto,
    ) {
        return this.service.update(req.user.userId, id, dto)
    }

    // @ApiOperation({ summary: 'Delete an application by ID' })
    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.userId, id)
    }
}
