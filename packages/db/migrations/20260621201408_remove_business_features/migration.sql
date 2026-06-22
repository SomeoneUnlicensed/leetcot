-- DropIndex
DROP INDEX "Championship_companyId_idx";

-- AlterTable
ALTER TABLE "Championship" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyId",
DROP COLUMN "companyRole";

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "ContactRequest";

