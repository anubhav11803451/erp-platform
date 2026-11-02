BEGIN;

-- Preserve existing rows/memberships; legacy bearer acceptances gain no Owner-decision evidence.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
            AND table_name = 'InstitutionAdminInvitation'
            AND column_name = 'claimed_at'
    ) THEN
        RAISE EXCEPTION
            'Claim-review columns already exist; inspect migration state before proceeding';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "InstitutionAdminInvitation"
        WHERE "status" = 'ACCEPTED'
            AND "accepted_at" IS NULL
    ) THEN
        RAISE EXCEPTION
            'An ACCEPTED invitation lacks its legacy acceptance timestamp; review before migration';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "InstitutionAdminInvitation"
        WHERE "status" = 'PENDING'
        GROUP BY "institution_id"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Multiple pending invitations exist for an Institution; review before migration';
    END IF;
END
$$;

DROP INDEX "InstitutionAdminInvitation_one_pending_per_institution_key";
ALTER TABLE "InstitutionAdminInvitation"
    DROP CONSTRAINT "InstitutionAdminInvitation_status_metadata_check",
    ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "InstitutionAdminInvitationStatus_new" AS ENUM (
    'PENDING',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'REVOKED',
    'EXPIRED',
    'LEGACY_ACCEPTED'
);

ALTER TABLE "InstitutionAdminInvitation"
    ALTER COLUMN "status" TYPE "InstitutionAdminInvitationStatus_new"
    USING (
        CASE
            WHEN "status"::TEXT = 'ACCEPTED' THEN 'LEGACY_ACCEPTED'
            ELSE "status"::TEXT
        END
    )::"InstitutionAdminInvitationStatus_new";

DROP TYPE "InstitutionAdminInvitationStatus";
ALTER TYPE "InstitutionAdminInvitationStatus_new"
    RENAME TO "InstitutionAdminInvitationStatus";

ALTER TABLE "InstitutionAdminInvitation"
    ALTER COLUMN "status" SET DEFAULT 'PENDING',
    ADD COLUMN "claimed_by_account_id" TEXT,
    ADD COLUMN "claimed_at" TIMESTAMP(3),
    ADD COLUMN "claimant_name" TEXT,
    ADD COLUMN "review_expires_at" TIMESTAMP(3),
    ADD COLUMN "decided_by_account_id" TEXT,
    ADD COLUMN "decided_at" TIMESTAMP(3),
    ADD COLUMN "status_credential_hash" TEXT,
    ADD COLUMN "status_credential_expires_at" TIMESTAMP(3);

ALTER TABLE "InstitutionAdminInvitation"
    ADD CONSTRAINT "InstitutionAdminInvitation_claimed_by_account_id_fkey"
        FOREIGN KEY ("claimed_by_account_id")
        REFERENCES "Account" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    ADD CONSTRAINT "InstitutionAdminInvitation_decided_by_account_id_fkey"
        FOREIGN KEY ("decided_by_account_id")
        REFERENCES "PlatformOwnerGrant" ("account_id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    ADD CONSTRAINT "InstitutionAdminInvitation_status_metadata_check"
        CHECK (
            (
                "status" = 'PENDING'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "claimed_by_account_id" IS NULL
                AND "claimed_at" IS NULL
                AND "claimant_name" IS NULL
                AND "review_expires_at" IS NULL
                AND "decided_by_account_id" IS NULL
                AND "decided_at" IS NULL
                AND "status_credential_hash" IS NULL
                AND "status_credential_expires_at" IS NULL
                AND "revoked_at" IS NULL
            )
            OR (
                "status" IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "claimed_by_account_id" IS NOT NULL
                AND "claimed_at" IS NOT NULL
                AND "claimant_name" IS NOT NULL
                AND btrim("claimant_name") <> ''
                AND "review_expires_at" IS NOT NULL
                AND "status_credential_hash" IS NOT NULL
                AND "status_credential_expires_at" IS NOT NULL
                AND "status_credential_expires_at" = "review_expires_at"
                AND "revoked_at" IS NULL
                AND (
                    (
                        "status" = 'PENDING_APPROVAL'
                        AND "decided_by_account_id" IS NULL
                        AND "decided_at" IS NULL
                    )
                    OR (
                        "status" IN ('APPROVED', 'REJECTED')
                        AND "decided_by_account_id" IS NOT NULL
                        AND "decided_at" IS NOT NULL
                    )
                )
            )
            OR (
                "status" = 'REVOKED'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "revoked_at" IS NOT NULL
                AND (
                    (
                        "claimed_by_account_id" IS NULL
                        AND "claimed_at" IS NULL
                        AND "claimant_name" IS NULL
                        AND "review_expires_at" IS NULL
                        AND "status_credential_hash" IS NULL
                        AND "status_credential_expires_at" IS NULL
                    )
                    OR (
                        "claimed_by_account_id" IS NOT NULL
                        AND "claimed_at" IS NOT NULL
                        AND "claimant_name" IS NOT NULL
                        AND btrim("claimant_name") <> ''
                        AND "review_expires_at" IS NOT NULL
                        AND "status_credential_hash" IS NOT NULL
                        AND "status_credential_expires_at" IS NOT NULL
                        AND "status_credential_expires_at" = "review_expires_at"
                    )
                )
                AND (
                    (
                        "decided_by_account_id" IS NULL
                        AND "decided_at" IS NULL
                    )
                    OR (
                        "decided_by_account_id" IS NOT NULL
                        AND "decided_at" IS NOT NULL
                    )
                )
            )
            OR (
                "status" = 'EXPIRED'
                AND "accepted_at" IS NULL
                AND "accepted_by_account_id" IS NULL
                AND "revoked_at" IS NULL
                AND "decided_by_account_id" IS NULL
                AND "decided_at" IS NULL
                AND (
                    (
                        "claimed_by_account_id" IS NULL
                        AND "claimed_at" IS NULL
                        AND "claimant_name" IS NULL
                        AND "review_expires_at" IS NULL
                        AND "status_credential_hash" IS NULL
                        AND "status_credential_expires_at" IS NULL
                    )
                    OR (
                        "claimed_by_account_id" IS NOT NULL
                        AND "claimed_at" IS NOT NULL
                        AND "claimant_name" IS NOT NULL
                        AND btrim("claimant_name") <> ''
                        AND "review_expires_at" IS NOT NULL
                        AND "status_credential_hash" IS NOT NULL
                        AND "status_credential_expires_at" IS NOT NULL
                        AND "status_credential_expires_at" = "review_expires_at"
                    )
                )
            )
            OR (
                "status" = 'LEGACY_ACCEPTED'
                AND "accepted_at" IS NOT NULL
                AND "revoked_at" IS NULL
                AND "claimed_by_account_id" IS NULL
                AND "claimed_at" IS NULL
                AND "claimant_name" IS NULL
                AND "review_expires_at" IS NULL
                AND "decided_by_account_id" IS NULL
                AND "decided_at" IS NULL
                AND "status_credential_hash" IS NULL
                AND "status_credential_expires_at" IS NULL
            )
        );

CREATE UNIQUE INDEX "InstitutionAdminInvitation_status_credential_hash_key"
    ON "InstitutionAdminInvitation"("status_credential_hash");
CREATE INDEX "InstitutionAdminInvitation_institution_id_status_expires_at_idx"
    ON "InstitutionAdminInvitation"("institution_id", "status", "expires_at");
CREATE INDEX "InstitutionAdminInvitation_institution_id_status_review_expires_at_idx"
    ON "InstitutionAdminInvitation"("institution_id", "status", "review_expires_at");
CREATE INDEX "InstitutionAdminInvitation_claimed_by_account_id_idx"
    ON "InstitutionAdminInvitation"("claimed_by_account_id");
CREATE INDEX "InstitutionAdminInvitation_decided_by_account_id_idx"
    ON "InstitutionAdminInvitation"("decided_by_account_id");

-- Pending links and pending Owner reviews both consume the Institution's single outstanding slot.
-- Expiry must be materialized as EXPIRED before a replacement can use this slot.
CREATE UNIQUE INDEX "InstitutionAdminInvitation_one_outstanding_per_institution_key"
    ON "InstitutionAdminInvitation"("institution_id")
    WHERE "status" IN ('PENDING', 'PENDING_APPROVAL');

COMMIT;
