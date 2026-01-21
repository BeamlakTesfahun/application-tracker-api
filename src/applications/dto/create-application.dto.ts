import {
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator'

export enum ApplicationStatusDto {
    DRAFT = 'DRAFT',
    APPLIED = 'APPLIED',
    INTERVIEWING = 'INTERVIEWING',
    OFFER = 'OFFER',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
}

export class CreateApplicationDto {
    @IsString()
    organizationId!: string

    @IsString()
    @MaxLength(160)
    title!: string

    @IsOptional()
    @IsEnum(ApplicationStatusDto)
    status?: ApplicationStatusDto

    @IsOptional()
    @IsISO8601()
    appliedAt?: string

    @IsOptional()
    @IsISO8601()
    lastActivityAt?: string

    @IsOptional()
    @IsUrl()
    sourceUrl?: string

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    notes?: string
}
