-- CreateTable
CREATE TABLE "ggl_smarthome_device" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ggl_smarthome_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ggl_smarthome_device_trait" (
    "id" SERIAL NOT NULL,
    "google_device_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ggl_smarthome_device_trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ggl_smarthome_trait_target" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "custom_id" TEXT NOT NULL,

    CONSTRAINT "ggl_smarthome_trait_target_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ggl_smarthome_device" ADD CONSTRAINT "ggl_smarthome_device_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "ggl_smarthome_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_device_trait" ADD CONSTRAINT "ggl_smarthome_device_trait_google_device_id_fkey" FOREIGN KEY ("google_device_id") REFERENCES "ggl_smarthome_device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_trait_target" ADD CONSTRAINT "ggl_smarthome_trait_target_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
