import type { PrismaClient } from "@prisma/client";

const DEFAULT_FOLDER_NAME = "默认收藏夹";

const USER_EMAILS = [
  "memory@example.com",
  "visitor01@example.com",
  "visitor02@example.com",
  "visitor03@example.com",
] as const;

export async function seedCollectionFolders(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [...USER_EMAILS],
      },
    },
  });

  for (const user of users) {
    const existingFolder = await prisma.collectionFolder.findFirst({
      where: {
        userId: user.id,
        name: DEFAULT_FOLDER_NAME,
      },
    });

    if (existingFolder) {
      await prisma.collectionFolder.update({
        where: { id: existingFolder.id },
        data: {
          isDefault: true,
        },
      });
      continue;
    }

    await prisma.collectionFolder.create({
      data: {
        userId: user.id,
        name: DEFAULT_FOLDER_NAME,
        isDefault: true,
      },
    });
  }
}
