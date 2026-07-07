-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
