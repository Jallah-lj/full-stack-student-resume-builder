import { seedDatabase } from "./seed";

async function main() {
  console.log("🌱 Running database seed script...");
  await seedDatabase();
  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
