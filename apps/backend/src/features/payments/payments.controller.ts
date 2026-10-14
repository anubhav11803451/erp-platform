import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, Payment } from '@erp/db/client';

@Controller('features/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    @Roles(UserRole.ADMIN) // Only Admins can create payments
    create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
        return this.paymentsService.create(createPaymentDto);
    }

    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Admins or Staff can see payment history
    getPaymentsByStudent(@Param('studentId', ParseUUIDPipe) studentId: string): Promise<Payment[]> {
        return this.paymentsService.getPaymentsByStudent(studentId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Payment | null> {
        return this.paymentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ): Promise<Payment> {
        return this.paymentsService.update(id, updatePaymentDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
        return this.paymentsService.remove(id);
    }
}
