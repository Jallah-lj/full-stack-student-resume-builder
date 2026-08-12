import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { route, ok } from "@/lib/api";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  // Bootstrap demo data on a fresh database so first run is never empty.
  await seedDatabase();

  const currentUser = await getSessionUser();

  if (!currentUser) {
    return ok({ user: null, availableUsers: [] });
  }

  // Demo persona switcher list — public fields only, never credentials.
  const availableUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      headline: users.headline,
      profilePictureUrl: users.profilePictureUrl,
      university: users.university,
    })
    .from(users);

  return ok({ user: toPublicUser(currentUser), availableUsers });
});
