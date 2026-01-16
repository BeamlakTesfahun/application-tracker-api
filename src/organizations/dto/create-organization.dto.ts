import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

export enum OrganizationTypeDto {
    JOB = 'JOB',
    SCHOOL = 'SCHOOL',
}

export class CreateOrganizationDto {
    @IsEnum(OrganizationTypeDto)
    type!: OrganizationTypeDto

    @IsString()
    @MaxLength(120)
    name!: string

    @IsOptional()
    @IsUrl()
    websiteUrl?: string

    @IsOptional()
    @IsString()
    @MaxLength(120)
    location?: string

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string
}
