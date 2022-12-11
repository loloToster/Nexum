-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tab" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" SERIAL NOT NULL,
    "custom_id" TEXT NOT NULL,
    "tab_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetProperties" (
    "id" SERIAL NOT NULL,
    "widget_id" INTEGER NOT NULL,
    "title" TEXT,
    "color" TEXT,
    "text" TEXT,
    "isSwitch" BOOLEAN,
    "isVertical" BOOLEAN,
    "step" DOUBLE PRECISION,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,

    CONSTRAINT "WidgetProperties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Value" (
    "device_id" INTEGER NOT NULL,
    "custom_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Value_pkey" PRIMARY KEY ("device_id","custom_id")
);

-- CreateTable
CREATE TABLE "_TabToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Widget_x_y_tab_id_key" ON "Widget"("x", "y", "tab_id");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetProperties_widget_id_key" ON "WidgetProperties"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_TabToUser_AB_unique" ON "_TabToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TabToUser_B_index" ON "_TabToUser"("B");

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Widget" ADD CONSTRAINT "Widget_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetProperties" ADD CONSTRAINT "WidgetProperties_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "Widget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TabToUser" ADD CONSTRAINT "_TabToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TabToUser" ADD CONSTRAINT "_TabToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
