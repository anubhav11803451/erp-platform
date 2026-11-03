import {
    Body,
    BadRequestException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ZodResponse } from 'nestjs-zod';
import { InstitutionAdminJwtAuthGuard } from '../../common/guards/institution-admin-jwt-auth.guard';
import type { AuthenticatedAccountRequest } from '../../common/guards/institution-admin-jwt-auth.guard';
import { InstitutionStaffJwtAuthGuard } from '../../common/guards/institution-staff-jwt-auth.guard';
import type { AuthenticatedStaffRequest } from '../../common/guards/institution-staff-jwt-auth.guard';
import {
    InstitutionAttendanceDayResponseDto,
    InstitutionAttendanceSaveDto,
    InstitutionGroupArchiveDto,
    InstitutionGroupCreateDto,
    InstitutionGroupListResponseDto,
    InstitutionGroupResponseDto,
    InstitutionGroupUpdateDto,
    InstitutionProfileResponseDto,
    InstitutionProfileUpdateDto,
    InstitutionStudentArchiveDto,
    InstitutionStudentCreateDto,
    InstitutionStaffContextResponseDto,
    InstitutionStudentGroupMembershipUpdateDto,
    InstitutionStudentListResponseDto,
    InstitutionStudentResponseDto,
    InstitutionStudentUpdateDto,
} from './institution-operations-controller.dto';
import { InstitutionActor, InstitutionOperationsService } from './institution-operations.service';

type AdminRequest = Request & AuthenticatedAccountRequest;
type StaffRequest = Request & AuthenticatedStaffRequest;

function validateSearch(search: unknown): string | undefined {
    if (search === undefined) {
        return undefined;
    }
    if (typeof search !== 'string' || search.length > 100) {
        throw new BadRequestException('Search text is invalid');
    }
    return search;
}

@Controller('institution')
@UseGuards(InstitutionAdminJwtAuthGuard)
export class InstitutionOperationsController {
    constructor(private readonly operationsService: InstitutionOperationsService) {}

    @Get('profile')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionProfileResponseDto })
    getProfile(@Req() request: AdminRequest) {
        return this.operationsService.getProfile(this.adminInstitutionId(request));
    }

    @Patch('profile')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionProfileResponseDto })
    updateProfile(@Req() request: AdminRequest, @Body() payload: InstitutionProfileUpdateDto) {
        return this.operationsService.updateProfile(this.adminInstitutionId(request), payload);
    }

    @Get('groups')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionGroupListResponseDto })
    listGroups(@Req() request: AdminRequest) {
        return this.operationsService.listGroups(this.adminInstitutionId(request));
    }

    @Post('groups')
    @ZodResponse({ status: HttpStatus.CREATED, type: InstitutionGroupResponseDto })
    createGroup(@Req() request: AdminRequest, @Body() payload: InstitutionGroupCreateDto) {
        return this.operationsService.createGroup(this.adminInstitutionId(request), payload);
    }

    @Patch('groups/:groupId')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionGroupResponseDto })
    updateGroup(
        @Req() request: AdminRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Body() payload: InstitutionGroupUpdateDto,
    ) {
        return this.operationsService.updateGroup(
            this.adminInstitutionId(request),
            groupId,
            payload,
        );
    }

    @Post('groups/:groupId/archive')
    @HttpCode(HttpStatus.NO_CONTENT)
    async archiveGroup(
        @Req() request: AdminRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Body() _payload: InstitutionGroupArchiveDto,
    ): Promise<void> {
        await this.operationsService.archiveGroup(this.adminInstitutionId(request), groupId);
    }

    @Get('students')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentListResponseDto })
    listStudents(@Req() request: AdminRequest, @Query('search') search?: string) {
        return this.operationsService.listAdminStudents(this.adminInstitutionId(request), {
            search: validateSearch(search),
        });
    }

    @Get('groups/:groupId/students')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentListResponseDto })
    listGroupStudents(
        @Req() request: AdminRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Query('search') search?: string,
    ) {
        return this.operationsService.listAdminStudents(this.adminInstitutionId(request), {
            groupId,
            search: validateSearch(search),
        });
    }

    @Post('students')
    @ZodResponse({ status: HttpStatus.CREATED, type: InstitutionStudentResponseDto })
    createStudent(@Req() request: AdminRequest, @Body() payload: InstitutionStudentCreateDto) {
        return this.operationsService.createStudent(this.adminInstitutionId(request), payload);
    }

    @Patch('students/:studentId')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentResponseDto })
    updateStudent(
        @Req() request: AdminRequest,
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
        @Body() payload: InstitutionStudentUpdateDto,
    ) {
        return this.operationsService.updateStudent(this.adminActor(request), studentId, payload);
    }

    @Post('students/:studentId/archive')
    @HttpCode(HttpStatus.NO_CONTENT)
    async archiveStudent(
        @Req() request: AdminRequest,
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
        @Body() _payload: InstitutionStudentArchiveDto,
    ): Promise<void> {
        await this.operationsService.archiveStudent(this.adminInstitutionId(request), studentId);
    }

    @Patch('students/:studentId/groups')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentResponseDto })
    updateStudentGroups(
        @Req() request: AdminRequest,
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
        @Body() payload: InstitutionStudentGroupMembershipUpdateDto,
    ) {
        return this.operationsService.updateStudentGroups(
            this.adminInstitutionId(request),
            studentId,
            payload.group_ids,
        );
    }

    @Get('groups/:groupId/attendance')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionAttendanceDayResponseDto })
    getAttendance(
        @Req() request: AdminRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Query('date') date: string,
    ) {
        return this.operationsService.getAttendanceDay(this.adminActor(request), groupId, date);
    }

    @Post('attendance')
    @HttpCode(HttpStatus.OK)
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionAttendanceDayResponseDto })
    saveAttendance(@Req() request: AdminRequest, @Body() payload: InstitutionAttendanceSaveDto) {
        return this.operationsService.saveAttendance(this.adminActor(request), payload);
    }

    private adminInstitutionId(request: AdminRequest): string {
        const institutionId = request.user?.institution_id;
        if (!institutionId) {
            throw new NotFoundException('Institution context unavailable');
        }
        return institutionId;
    }

    private adminActor(request: AdminRequest): InstitutionActor {
        const user = request.user;
        if (!user?.id) {
            throw new NotFoundException('Authenticated account unavailable');
        }
        return {
            accountId: user.id,
            institutionId: this.adminInstitutionId(request),
            role: 'ADMIN',
        };
    }
}

@Controller('institution/staff')
@UseGuards(InstitutionStaffJwtAuthGuard)
export class InstitutionStaffOperationsController {
    constructor(private readonly operationsService: InstitutionOperationsService) {}

    @Get('context')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStaffContextResponseDto })
    getContext(@Req() request: StaffRequest) {
        return this.operationsService.getStaffContext(this.staffActor(request).institutionId);
    }

    @Get('groups')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionGroupListResponseDto })
    listAssignedGroups(@Req() request: StaffRequest) {
        return this.operationsService.listAssignedGroups(this.staffActor(request));
    }

    @Get('groups/:groupId/students')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentListResponseDto })
    listGroupStudents(
        @Req() request: StaffRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Query('search') search?: string,
    ) {
        return this.operationsService.listStaffStudents(this.staffActor(request), {
            groupId,
            search: validateSearch(search),
        });
    }

    @Patch('students/:studentId')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionStudentResponseDto })
    updateStudent(
        @Req() request: StaffRequest,
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
        @Body() payload: InstitutionStudentUpdateDto,
    ) {
        return this.operationsService.updateStudent(this.staffActor(request), studentId, payload);
    }

    @Get('groups/:groupId/attendance')
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionAttendanceDayResponseDto })
    getAttendance(
        @Req() request: StaffRequest,
        @Param('groupId', new ParseUUIDPipe()) groupId: string,
        @Query('date') date: string,
    ) {
        return this.operationsService.getAttendanceDay(this.staffActor(request), groupId, date);
    }

    @Post('attendance')
    @HttpCode(HttpStatus.OK)
    @ZodResponse({ status: HttpStatus.OK, type: InstitutionAttendanceDayResponseDto })
    saveAttendance(@Req() request: StaffRequest, @Body() payload: InstitutionAttendanceSaveDto) {
        return this.operationsService.saveAttendance(this.staffActor(request), payload);
    }

    private staffActor(request: StaffRequest): InstitutionActor {
        const user = request.user;
        if (!user?.institution_id) {
            throw new NotFoundException('Institution context unavailable');
        }
        return {
            accountId: user.id,
            institutionId: user.institution_id,
            role: 'STAFF',
        };
    }
}
