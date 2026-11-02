BEGIN;

-- Keep existing rows intact. New create flows require these values at the shared/API boundary.
ALTER TABLE "LegalEntity"
    ADD COLUMN "code" TEXT;

ALTER TABLE "Institution"
    ADD COLUMN "code_suffix" TEXT;

ALTER TABLE "InstitutionAdminInvitation"
    ADD COLUMN "invited_email" TEXT,
    ADD COLUMN "owner_contact_name" TEXT,
    ADD COLUMN "owner_contact_phone" TEXT;

CREATE UNIQUE INDEX "LegalEntity_code_key"
    ON "LegalEntity"("code");

CREATE UNIQUE INDEX "Institution_legal_entity_id_code_suffix_key"
    ON "Institution"("legal_entity_id", "code_suffix");

ALTER TABLE "LegalEntity"
    ADD CONSTRAINT "LegalEntity_code_format_check"
        CHECK (
            "code" IS NULL
            OR (
                char_length("code") BETWEEN 2 AND 12
                AND "code" ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'
            )
        );

ALTER TABLE "Institution"
    ADD CONSTRAINT "Institution_code_suffix_format_check"
        CHECK (
            "code_suffix" IS NULL
            OR (
                char_length("code_suffix") BETWEEN 2 AND 12
                AND "code_suffix" ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'
            )
        );

ALTER TABLE "InstitutionAdminInvitation"
    ADD CONSTRAINT "InstitutionAdminInvitation_invited_email_normalized_check"
        CHECK (
            "invited_email" IS NULL
            OR (
                "invited_email" = lower(btrim("invited_email"))
                AND "invited_email" <> ''
            )
        );

COMMIT;
