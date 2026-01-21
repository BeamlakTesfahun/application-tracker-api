import {
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export enum ApplicationEventTypeDto {
    INTERVIEW = 'INTERVIEW',
    FOLLOW_UP = 'FOLLOW_UP',
    ASSESSMENT = 'ASSESSMENT',
    DEADLINE = 'DEADLINE',
    CALL = 'CALL',
    OTHER = 'OTHER',
}

export class CreateEventDto {
    @IsEnum(ApplicationEventTypeDto)
    type!: ApplicationEventTypeDto

    @IsString()
    @MaxLength(160)
    title!: string

    @IsOptional()
    @IsISO8601()
    scheduledAt?: string

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    notes?: string
}
