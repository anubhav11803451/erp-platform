BEGIN;

-- Fail before canonicalizing any account email. Never merge accounts automatically.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Account"
        GROUP BY lower(btrim("email"))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Account.email normalization collision; resolve manually before migration (no merge)';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "Account"
        WHERE btrim("email") = ''
    ) THEN
        RAISE EXCEPTION 'Blank Account.email prevents normalization; resolve before migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
            AND table_name = 'Account'
            AND column_name = 'identity_kind'
    ) THEN
        RAISE EXCEPTION
            'Unexpected Account.identity_kind exists; review before migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
            AND table_name = 'Session'
            AND column_name = 'rotation_family_id'
    ) THEN
        RAISE EXCEPTION
            'Unexpected Session.rotation_family_id exists; review before migration';
    END IF;

    IF to_regclass('"InstitutionAdminMembership"') IS NOT NULL THEN
        RAISE EXCEPTION
            'Unexpected InstitutionAdminMembership already exists; review existing membership data';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "PlatformOwnerGrant" AS owner_grant
        LEFT JOIN "Account" AS account_row
            ON account_row."id" = owner_grant."account_id"
        WHERE account_row."id" IS NULL
    ) THEN
        RAISE EXCEPTION
            'PlatformOwnerGrant references a missing Account; review before migration';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = current_schema()
            AND table_name = 'Session'
    ) THEN
        RAISE EXCEPTION 'Session table is missing; review migration baseline before proceeding';
    END IF;
END
$$;

CREATE TYPE "AccountIdentityKind" AS ENUM ('UNASSIGNED', 'PLATFORM_OWNER', 'INSTITUTION_ADMIN');
CREATE TYPE "InstitutionAdminInvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED'
);

ALTER TABLE "Account"
    ADD COLUMN "identity_kind" "AccountIdentityKind" NOT NULL DEFAULT 'UNASSIGNED';

-- The approved legacy classification is grant-bearing => PLATFORM_OWNER, otherwise UNASSIGNED.
UPDATE "Account" AS account_row
SET "identity_kind" = 'PLATFORM_OWNER'
FROM "PlatformOwnerGrant" AS owner_grant
WHERE owner_grant."account_id" = account_row."id";

-- Assert that the completed backfill matches the current authority table before constraints.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Account" AS account_row
        LEFT JOIN "PlatformOwnerGrant" AS owner_grant
            ON owner_grant."account_id" = account_row."id"
        WHERE
            (
                owner_grant."account_id" IS NOT NULL
                AND account_row."identity_kind" <> 'PLATFORM_OWNER'
            )
            OR (
                owner_grant."account_id" IS NULL
                AND account_row."identity_kind" <> 'UNASSIGNED'
            )
    ) THEN
        RAISE EXCEPTION
            'Account.identity_kind backfill contradicts PlatformOwnerGrant classification';
    END IF;
END
$$;

UPDATE "Account"
SET "email" = lower(btrim("email"));

-- Start each pre-existing Session as its own family. Do not infer or merge lineage.
ALTER TABLE "Session"
    ADD COLUMN "rotation_family_id" TEXT;

UPDATE "Session"
SET "rotation_family_id" = "id";

-- Cut over by invalidating all still-unexpired refresh sessions. Users must sign in again.
UPDATE "Session"
SET "revoked_at" = CURRENT_TIMESTAMP
WHERE "revoked_at" IS NULL
    AND "expires_at" > CURRENT_TIMESTAMP;

ALTER TABLE "Session"
    ALTER COLUMN "rotation_family_id" SET NOT NULL;

CREATE INDEX "Session_rotation_family_id_idx"
    ON "Session"("rotation_family_id");

ALTER TABLE "Account"
    ADD CONSTRAINT "Account_email_canonical_check"
        CHECK ("email" = lower(btrim("email")) AND "email" <> ''),
    ADD CONSTRAINT "Account_id_identity_kind_key" UNIQUE ("id", "identity_kind");

ALTER TABLE "PlatformOwnerGrant"
    ADD COLUMN "account_identity_kind" "AccountIdentityKind" NOT NULL DEFAULT 'PLATFORM_OWNER';

ALTER TABLE "PlatformOwnerGrant"
    DROP CONSTRAINT "PlatformOwnerGrant_account_id_fkey",
    ADD CONSTRAINT "PlatformOwnerGrant_account_kind_key"
        UNIQUE ("account_id", "account_identity_kind"),
    ADD CONSTRAINT "PlatformOwnerGrant_account_identity_kind_check"
        CHECK ("account_identity_kind" = 'PLATFORM_OWNER'),
    ADD CONSTRAINT "OwnerGrant_account_kind_fkey"
        FOREIGN KEY ("account_id", "account_identity_kind")
        REFERENCES "Account" ("id", "identity_kind")
        ON DELETE CASCADE
        ON UPDATE CASCADE;

CREATE TABLE "InstitutionAdminMembership" (
    "account_id" TEXT NOT NULL,
    "account_identity_kind" "AccountIdentityKind" NOT NULL DEFAULT 'INSTITUTION_ADMIN',
    "institution_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionAdminMembership_pkey" PRIMARY KEY ("account_id"),
    CONSTRAINT "InstitutionAdminMembership_account_kind_key"
        UNIQUE ("account_id", "account_identity_kind"),
    CONSTRAINT "InstitutionAdminMembership_account_identity_kind_check"
        CHECK ("account_identity_kind" = 'INSTITUTION_ADMIN'),
    CONSTRAINT "InstitutionAdminMembership_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAdminMembership_account_kind_fkey"
        FOREIGN KEY ("account_id", "account_identity_kind")
        REFERENCES "Account" ("id", "identity_kind")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionAdminMembership_institution_id_idx"
    ON "InstitutionAdminMembership"("institution_id");

CREATE TABLE "InstitutionAdminInvitation" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" "InstitutionAdminInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_account_id" TEXT,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionAdminInvitation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionAdminInvitation_token_hash_key" UNIQUE ("token_hash"),
    CONSTRAINT "InstitutionAdminInvitation_institution_id_fkey"
        FOREIGN KEY ("institution_id")
        REFERENCES "Institution" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAdminInvitation_accepted_by_account_id_fkey"
        FOREIGN KEY ("accepted_by_account_id")
        REFERENCES "Account" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAdminInvitation_status_metadata_check"
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
        )
);

CREATE INDEX "InstitutionAdminInvitation_institution_id_status_created_at_idx"
    ON "InstitutionAdminInvitation"("institution_id", "status", "created_at");
CREATE INDEX "InstitutionAdminInvitation_accepted_by_account_id_idx"
    ON "InstitutionAdminInvitation"("accepted_by_account_id");

-- Prisma does not represent partial unique indexes; issuance must first transition stale PENDING
-- rows to EXPIRED while serializing on the Institution row.
CREATE UNIQUE INDEX "InstitutionAdminInvitation_one_pending_per_institution_key"
    ON "InstitutionAdminInvitation"("institution_id")
    WHERE "status" = 'PENDING';

CREATE TABLE "InstitutionAdminInvitationContinuation" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "credential_hash" TEXT NOT NULL,
    "account_id" TEXT,
    "csrf_token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "InstitutionAdminInvitationContinuation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InstitutionAdminInvitationContinuation_credential_hash_key"
        UNIQUE ("credential_hash"),
    CONSTRAINT "InstitutionAdminInvitationContinuation_invitation_id_fkey"
        FOREIGN KEY ("invitation_id")
        REFERENCES "InstitutionAdminInvitation" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "InstitutionAdminInvitationContinuation_account_id_fkey"
        FOREIGN KEY ("account_id")
        REFERENCES "Account" ("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "InstitutionAdminInvitationContinuation_invitation_id_idx"
    ON "InstitutionAdminInvitationContinuation"("invitation_id");
CREATE INDEX "InstitutionAdminInvitationContinuation_account_id_idx"
    ON "InstitutionAdminInvitationContinuation"("account_id");
CREATE INDEX "InstitutionAdminInvitationContinuation_expires_at_idx"
    ON "InstitutionAdminInvitationContinuation"("expires_at");
CREATE INDEX "InstitutionAdminInvitationContinuation_revoked_at_idx"
    ON "InstitutionAdminInvitationContinuation"("revoked_at");

COMMIT;
