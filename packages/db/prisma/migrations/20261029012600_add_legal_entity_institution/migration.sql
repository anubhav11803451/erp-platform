-- CreateTable
CREATE TABLE "LegalEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "legal_entity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institution_legal_entity_id_idx" ON "Institution"("legal_entity_id");

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
