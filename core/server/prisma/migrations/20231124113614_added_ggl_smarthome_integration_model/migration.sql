-- CreateTable
CREATE TABLE "ggl_smarthome_integrations" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT,
    "code_expires" TIMESTAMP(3),
    "access_token" TEXT,
    "refresh_token" TEXT,
    "access_token_expires" TIMESTAMP(3),

    CONSTRAINT "ggl_smarthome_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ggl_smarthome_integrations_user_id_key" ON "ggl_smarthome_integrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ggl_smarthome_integrations_code_key" ON "ggl_smarthome_integrations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ggl_smarthome_integrations_access_token_key" ON "ggl_smarthome_integrations"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "ggl_smarthome_integrations_refresh_token_key" ON "ggl_smarthome_integrations"("refresh_token");

-- AddForeignKey
ALTER TABLE "ggl_smarthome_integrations" ADD CONSTRAINT "ggl_smarthome_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
