import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto, UpdateGuardianDto } from './dto';
import { Guardian, UserRole } from '@erp/db/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('domains/guardians')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardiansController {
    constructor(private readonly guardiansService: GuardiansService) {}

    // Note: This 'create' is normally called by the StudentsService.
    // If called directly, only an ADMIN should do it.
    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createGuardianDto: CreateGuardianDto): Promise<Guardian> {
        return this.guardiansService.create(createGuardianDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.STAFF) // <-- Both roles can view
    findAll(): Promise<Guardian[]> {
        return this.guardiansService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // <-- Both roles can view
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Guardian | null> {
        return this.guardiansService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN) // <-- Only ADMINs can update
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateGuardianDto: UpdateGuardianDto,
    ): Promise<Guardian> {
        return this.guardiansService.update(id, updateGuardianDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN) // <-- Only ADMINs can delete
    remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Guardian> {
        return this.guardiansService.remove(id);
    }
}
