import type {
    Batch as IBatch,
    User as IUser,
    Student as IStudent,
    Guardian as IGuardian,
    StudentBatch as IStudentBatch,
    Payment as IPayment,
    Attendance as IAttendance,
} from '@erp/db/frontend';

//Request Types
export interface TokenPayload {
    email: string;
    sub: string;
    role: UserResponse['role'];
}

//Response Types
export type UserResponse = Omit<IUser, 'password'>;

export interface AuthResponse {
    access_token: string;
    csrf_token: string;
    user: UserResponse;
}

export type BatchResponse = IBatch;
export type StudentResponse = IStudent;
export type GuardianResponse = IGuardian;
export type StudentBatchResponse = IStudentBatch;
export type PaymentResponse = IPayment;

export type EnrichedBatch = BatchResponse & {
    tutor: UserResponse | null;
};

export type EnrichedStudent = StudentResponse & {
    guardian: GuardianResponse;
};

export type EnrolledStudent = StudentBatchResponse & {
    student: EnrichedStudent;
};

export type BatchEnrollment = StudentBatchResponse & {
    batch: Pick<BatchResponse, 'id' | 'name' | 'subject'>;
};

export type EnrichedPayment = PaymentResponse & {
    batch: Pick<BatchResponse, 'name' | 'subject'>;
};

export type BatchAttendanceResponse = IAttendance & {
    student: Pick<IStudent, 'id' | 'first_name' | 'last_name'>;
};

export type AttendanceMarkResponse = {
    message: string;
    count: number;
};

// Type for the /stats endpoint
export type DashboardStatsResponse = {
    totalStudents: number;
    activeBatches: number;
    totalRevenue?: number; // Optional, only for Admins
};

// Type for the /activity endpoint
export type RecentActivityResponse = {
    recentPayments: (EnrichedPayment & {
        student: { first_name: string; last_name: string };
    })[];
    recentEnrollments: (EnrolledStudent & {
        student: { first_name: string; last_name: string };
        batch: { name: string; subject: string | null };
    })[];
};
