-- PostgreSQL requires an enum value added with ALTER TYPE to be committed before use.
-- Keep this boundary before the transaction that creates the Staff membership enum default.
BEGIN;
ALTER TYPE "AccountIdentityKind" ADD VALUE IF NOT EXISTS 'INSTITUTION_STAFF';
COMMIT;

BEGIN;

CREATE TYPE "InstitutionStaffInvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED'
);

CREATE TYPE "InstitutionGroupType" AS ENUM (
    'SCHOOL_SECTION',
    'COACHING_BATCH'
);

CREATE TYPE "InstitutionAttendanceMarkStatus" AS ENUM (
    'PRESENT',
    'ABSENT'
);

ALTER TABLE "Institution"
    ADD COLUMN "timezone" TEXT,
    ADD CONSTRAINT "Institution_timezone_not_blank_check"
        CHECK ("timezone" IS NULL OR btrim("timezone") <> '');

CREATE TABLE "InstitutionStaffMembership" (
    "account_id" TEXT NOT NULL,
    "account_identity_kind" "AccountIdentityKind" NOT NULL DEFAULT 'INSTITUTION_STAFF',
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionStaffMembership_pkey" PRIMARY KEY ("account_id"),
    CONSTRAINT "InstitutionStaffMembership_account_kind_key"
        UNIQUE ("account_id", "account_identity_kind"),
    CONSTRAINT "InstitutionStaffMembership_institution_account_key"
        UNIQUE ("institution_id", "account_id"),
    CONSTRAINT "InstitutionStaffMembership_account_identity_kind_check"
        CHECK ("account_identity_kind" = 'INSTITUTION_STAFF'),
    CONSTRAINT "InstitutionStaffMembership_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffMembership_account_kind_fkey"
        FOREIGN KEY ("account_id", "account_identity_kind")
        REFERENCES "Account" ("id", "identity_kind")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStaffMembership_institution_id_revoked_at_created_at_idx"
    ON "InstitutionStaffMembership"("institution_id", "revoked_at", "created_at");

CREATE TABLE "InstitutionGroup" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionGroupType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionGroup_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionGroup_institution_id_id_key" UNIQUE ("institution_id", "id"),
    CONSTRAINT "InstitutionGroup_name_not_blank_check"
        CHECK (btrim("name") <> '' AND char_length("name") <= 160),
    CONSTRAINT "InstitutionGroup_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionGroup_institution_id_archived_at_name_idx"
    ON "InstitutionGroup"("institution_id", "archived_at", "name");
CREATE INDEX "InstitutionGroup_institution_id_type_archived_at_idx"
    ON "InstitutionGroup"("institution_id", "type", "archived_at");

CREATE TABLE "InstitutionStudent" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "local_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionStudent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionStudent_institution_id_id_key" UNIQUE ("institution_id", "id"),
    CONSTRAINT "InstitutionStudent_display_name_not_blank_check"
        CHECK (btrim("display_name") <> '' AND char_length("display_name") <= 160),
    CONSTRAINT "InstitutionStudent_local_id_trimmed_check"
        CHECK (
            "local_id" IS NULL
            OR (
                "local_id" = btrim("local_id")
                AND "local_id" <> ''
                AND char_length("local_id") <= 64
            )
        ),
    CONSTRAINT "InstitutionStudent_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStudent_institution_id_display_name_idx"
    ON "InstitutionStudent"("institution_id", "display_name");
CREATE INDEX "InstitutionStudent_institution_id_archived_at_idx"
    ON "InstitutionStudent"("institution_id", "archived_at");

-- This expression index deliberately includes archived students so their IDs remain reserved.
CREATE UNIQUE INDEX "InstitutionStudent_institution_local_id_ci_key"
    ON "InstitutionStudent"("institution_id", lower(btrim("local_id")))
    WHERE "local_id" IS NOT NULL;

CREATE TABLE "InstitutionStaffInvitation" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "normalized_email" TEXT NOT NULL,
    "status" "InstitutionStaffInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_account_id" TEXT,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionStaffInvitation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionStaffInvitation_institution_id_id_key"
        UNIQUE ("institution_id", "id"),
    CONSTRAINT "InstitutionStaffInvitation_token_hash_key" UNIQUE ("token_hash"),
    CONSTRAINT "InstitutionStaffInvitation_normalized_email_check"
        CHECK (
            "normalized_email" = lower(btrim("normalized_email"))
            AND "normalized_email" <> ''
        ),
    CONSTRAINT "InstitutionStaffInvitation_expiry_check"
        CHECK ("expires_at" > "created_at"),
    CONSTRAINT "InstitutionStaffInvitation_status_metadata_check"
        CHECK (
            (
                "status" = 'PENDING'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "revoked_at" IS NULL
            )
            OR (
                "status" = 'ACCEPTED'
                AND "accepted_at" IS NOT NULL
                AND "accepted_by_account_id" IS NOT NULL
                AND "revoked_at" IS NULL
            )
            OR (
                "status" = 'REVOKED'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "revoked_at" IS NOT NULL
            )
            OR (
                "status" = 'EXPIRED'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "revoked_at" IS NULL
            )
        ),
    CONSTRAINT "InstitutionStaffInvitation_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffInvitation_accepted_membership_fkey"
        FOREIGN KEY ("institution_id", "accepted_by_account_id")
        REFERENCES "InstitutionStaffMembership" ("institution_id", "account_id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStaffInvitation_institution_id_status_created_at_idx"
    ON "InstitutionStaffInvitation"("institution_id", "status", "created_at");
CREATE INDEX "InstitutionStaffInvitation_institution_id_status_expires_at_idx"
    ON "InstitutionStaffInvitation"("institution_id", "status", "expires_at");
CREATE INDEX "InstitutionStaffInvitation_institution_id_accepted_by_account_id_idx"
    ON "InstitutionStaffInvitation"("institution_id", "accepted_by_account_id");

-- Expired invitations must first transition to EXPIRED before a replacement is issued.
CREATE UNIQUE INDEX "InstitutionStaffInvitation_one_pending_per_institution_email_key"
    ON "InstitutionStaffInvitation"("institution_id", "normalized_email")
    WHERE "status" = 'PENDING';

CREATE TABLE "InstitutionStaffInvitationPendingGroup" (
    "institution_id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "InstitutionStaffInvitationPendingGroup_pkey"
        PRIMARY KEY ("institution_id", "invitation_id", "group_id"),
    CONSTRAINT "InstitutionStaffInvitationPendingGroup_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffInvitationPendingGroup_invitation_fkey"
        FOREIGN KEY ("institution_id", "invitation_id")
        REFERENCES "InstitutionStaffInvitation" ("institution_id", "id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffInvitationPendingGroup_group_fkey"
        FOREIGN KEY ("institution_id", "group_id")
        REFERENCES "InstitutionGroup" ("institution_id", "id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStaffInvitationPendingGroup_institution_id_group_id_idx"
    ON "InstitutionStaffInvitationPendingGroup"("institution_id", "group_id");

CREATE TABLE "InstitutionStaffGroupAssignment" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "staff_account_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionStaffGroupAssignment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionStaffGroupAssignment_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffGroupAssignment_membership_fkey"
        FOREIGN KEY ("institution_id", "staff_account_id")
        REFERENCES "InstitutionStaffMembership" ("institution_id", "account_id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStaffGroupAssignment_group_fkey"
        FOREIGN KEY ("institution_id", "group_id")
        REFERENCES "InstitutionGroup" ("institution_id", "id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStaffGroupAssignment_institution_id_staff_account_id_revoked_at_idx"
    ON "InstitutionStaffGroupAssignment"("institution_id", "staff_account_id", "revoked_at");
CREATE INDEX "InstitutionStaffGroupAssignment_institution_id_group_id_revoked_at_idx"
    ON "InstitutionStaffGroupAssignment"("institution_id", "group_id", "revoked_at");
CREATE UNIQUE INDEX "InstitutionStaffGroupAssignment_one_active_assignment_key"
    ON "InstitutionStaffGroupAssignment"("institution_id", "staff_account_id", "group_id")
    WHERE "revoked_at" IS NULL;

CREATE TABLE "InstitutionStudentGroupMembership" (
    "institution_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionStudentGroupMembership_pkey"
        PRIMARY KEY ("institution_id", "student_id", "group_id"),
    CONSTRAINT "InstitutionStudentGroupMembership_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStudentGroupMembership_student_fkey"
        FOREIGN KEY ("institution_id", "student_id")
        REFERENCES "InstitutionStudent" ("institution_id", "id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionStudentGroupMembership_group_fkey"
        FOREIGN KEY ("institution_id", "group_id")
        REFERENCES "InstitutionGroup" ("institution_id", "id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionStudentGroupMembership_institution_id_group_id_archived_at_idx"
    ON "InstitutionStudentGroupMembership"("institution_id", "group_id", "archived_at");
CREATE INDEX "InstitutionStudentGroupMembership_institution_id_student_id_archived_at_idx"
    ON "InstitutionStudentGroupMembership"("institution_id", "student_id", "archived_at");

CREATE TABLE "InstitutionAttendanceMark" (
    "institution_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "InstitutionAttendanceMarkStatus" NOT NULL,
    "updated_by_account_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionAttendanceMark_pkey"
        PRIMARY KEY ("institution_id", "group_id", "student_id", "attendance_date"),
    CONSTRAINT "InstitutionAttendanceMark_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAttendanceMark_membership_fkey"
        FOREIGN KEY ("institution_id", "student_id", "group_id")
        REFERENCES "InstitutionStudentGroupMembership" ("institution_id", "student_id", "group_id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAttendanceMark_updated_by_account_id_fkey"
        FOREIGN KEY ("updated_by_account_id")
        REFERENCES "Account" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionAttendanceMark_institution_id_group_id_attendance_date_idx"
    ON "InstitutionAttendanceMark"("institution_id", "group_id", "attendance_date");
CREATE INDEX "InstitutionAttendanceMark_institution_id_student_id_attendance_date_idx"
    ON "InstitutionAttendanceMark"("institution_id", "student_id", "attendance_date");

COMMIT;
