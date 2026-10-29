import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';
import {
    CreateInitialLegalEntityDto,
    InstitutionPairResponseDto,
    LegalEntityListResponseDto,
} from './dto/owner-controller.dto';
import { OwnerService } from './owner.service';

@Controller('owner/legal-entities')
@UseGuards(PlatformOwnerJwtAuthGuard)
export class OwnerController {
    constructor(private readonly ownerService: OwnerService) {}

    @Get()
    @ZodResponse({
        status: 200,
        type: LegalEntityListResponseDto,
    })
    listLegalEntities() {
        return this.ownerService.listLegalEntities();
    }

    @Post()
    @ZodResponse({
        status: 201,
        type: InstitutionPairResponseDto,
    })
    createInitialPair(@Body() payload: CreateInitialLegalEntityDto) {
        return this.ownerService.createInitialPair(payload);
    }
}
