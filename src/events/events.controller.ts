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
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

@UseGuards(JwtAuthGuard)
@Controller()
export class EventsController {
    constructor(private service: EventsService) {}

    // Create event under an application
    @Post('applications/:applicationId/events')
    create(
        @Req() req: any,
        @Param('applicationId') applicationId: string,
        @Body() dto: CreateEventDto,
    ) {
        return this.service.create(req.user.userId, applicationId, dto)
    }

    // List events for an application
    @Get('applications/:applicationId/events')
    list(@Req() req: any, @Param('applicationId') applicationId: string) {
        return this.service.listForApplication(req.user.userId, applicationId)
    }

    // Update event by id
    @Patch('events/:id')
    update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateEventDto,
    ) {
        return this.service.update(req.user.userId, id, dto)
    }

    // Mark complete quickly
    @Patch('events/:id/complete')
    complete(@Req() req: any, @Param('id') id: string) {
        return this.service.markCompleteNow(req.user.userId, id)
    }

    // Delete event
    @Delete('events/:id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.service.remove(req.user.userId, id)
    }
}
