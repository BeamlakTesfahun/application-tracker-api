import { PartialType } from '@nestjs/mapped-types'
import { CreateEventDto } from './create-event.dto'
import { IsISO8601, IsOptional } from 'class-validator'

export class UpdateEventDto extends PartialType(CreateEventDto) {
    @IsOptional()
    @IsISO8601()
    completedAt?: string | null
}
