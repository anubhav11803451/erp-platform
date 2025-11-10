import type {
    Batch as IBatch,
    User as IUser,
    Student as IStudent,
    Guardian as IGuardian,
    StudentBatch as IStudentBatch,
    Payment as IPayment,
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
    batch: Pick<BatchResponse, 'name'>;
};
