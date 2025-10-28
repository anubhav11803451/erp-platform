import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto, UpdateGuardianDto } from './dto';
import { Guardian } from '@erp/db';

@Controller('domains/guardians')
export class GuardiansController {
    constructor(private readonly guardiansService: GuardiansService) {}

    @Post()
    create(@Body() createGuardianDto: CreateGuardianDto): Promise<Guardian> {
        return this.guardiansService.create(createGuardianDto);
    }

    @Get()
    findAll(): Promise<Guardian[]> {
        return this.guardiansService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Guardian | null> {
        return this.guardiansService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateGuardianDto: UpdateGuardianDto,
    ): Promise<Guardian> {
        return this.guardiansService.update(id, updateGuardianDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<Guardian> {
        return this.guardiansService.remove(id);
    }
}
