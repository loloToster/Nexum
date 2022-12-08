-- CreateTable
CREATE TABLE "Value" (
    "device_id" INTEGER NOT NULL,
    "custom_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("device_id", "custom_id")
);
