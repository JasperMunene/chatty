-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "profilePicture" TEXT;

-- AlterTable
ALTER TABLE "ChatUser" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT;
