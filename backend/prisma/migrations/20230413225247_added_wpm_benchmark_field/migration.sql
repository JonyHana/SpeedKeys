/*
  Warnings:

  - Added the required column `WPM` to the `Benchmark` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Benchmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "completed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elapsedTime" INTEGER NOT NULL,
    "WPM" INTEGER NOT NULL,
    CONSTRAINT "Benchmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Benchmark" ("completed", "elapsedTime", "id", "userId") SELECT "completed", "elapsedTime", "id", "userId" FROM "Benchmark";
DROP TABLE "Benchmark";
ALTER TABLE "new_Benchmark" RENAME TO "Benchmark";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
