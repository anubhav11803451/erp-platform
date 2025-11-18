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
    Req,
} from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto, UpdateBatchDto } from './dto';
import { Batch, UserRole } from '@erp/db/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserResponse } from '@erp/shared';

@Controller('domains/batches')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes in this controller
export class BatchesController {
    constructor(private readonly batchesService: BatchesService) {}

    // --- ADMIN ONLY ROUTES ---
    @Post()
    @Roles(UserRole.ADMIN) // Only Admin can create new batches
    create(@Body() createBatchDto: CreateBatchDto): Promise<Batch> {
        return this.batchesService.create(createBatchDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN) // Only Admin can update batch details
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateBatchDto: UpdateBatchDto,
    ): Promise<Batch> {
        return this.batchesService.update(id, updateBatchDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN) // Only Admin can delete a batch
    remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Batch> {
        return this.batchesService.remove(id);
    }

    // --- ADMIN/STAFF READ ROUTES ---

    @Get()
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Both roles can view all batches
    findAll(): Promise<Batch[]> {
        return this.batchesService.findAll();
    }

    @Get('my-batches')
    @Roles(UserRole.STAFF) // Only for Staff/Tutors
    findMyBatches(@Req() req: { user: UserResponse }): Promise<Batch[]> {
        const userId = req.user.id;
        return this.batchesService.findBatchesByTutor(userId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Both roles can view a single batch
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Batch> {
        return this.batchesService.findOne(id);
    }
}
