/*
  Warnings:

  - You are about to alter the column `elapsedTime` on the `Benchmark` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Benchmark" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "completed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elapsedTime" REAL NOT NULL,
    "WPM" INTEGER NOT NULL,
    CONSTRAINT "Benchmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Benchmark" ("WPM", "completed", "elapsedTime", "id", "userId") SELECT "WPM", "completed", "elapsedTime", "id", "userId" FROM "Benchmark";
DROP TABLE "Benchmark";
ALTER TABLE "new_Benchmark" RENAME TO "Benchmark";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
