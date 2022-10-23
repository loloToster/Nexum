-- CreateTable
CREATE TABLE "Tab" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TabToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TabToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tab" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TabToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_TabToUser_AB_unique" ON "_TabToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TabToUser_B_index" ON "_TabToUser"("B");
