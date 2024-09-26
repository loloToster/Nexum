-- DropForeignKey
ALTER TABLE "ggl_smarthome_device" DROP CONSTRAINT "ggl_smarthome_device_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "ggl_smarthome_device_trait" DROP CONSTRAINT "ggl_smarthome_device_trait_google_device_id_fkey";

-- DropForeignKey
ALTER TABLE "ggl_smarthome_trait_target" DROP CONSTRAINT "ggl_smarthome_trait_target_traitId_fkey";

-- DropForeignKey
ALTER TABLE "widget_properties" DROP CONSTRAINT "widget_properties_widget_id_fkey";

-- AddForeignKey
ALTER TABLE "widget_properties" ADD CONSTRAINT "widget_properties_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_device" ADD CONSTRAINT "ggl_smarthome_device_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "ggl_smarthome_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_device_trait" ADD CONSTRAINT "ggl_smarthome_device_trait_google_device_id_fkey" FOREIGN KEY ("google_device_id") REFERENCES "ggl_smarthome_device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ggl_smarthome_trait_target" ADD CONSTRAINT "ggl_smarthome_trait_target_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "ggl_smarthome_device_trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
