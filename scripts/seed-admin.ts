/**
 * Creates the first admin account.
 *
 * Signup always creates residents, so the very first admin has to be
 * bootstrapped. Run it once:
 *
 *   npm run seed:admin
 *
 * Configure it with environment variables (never commit them):
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE, ADMIN_ADDRESS
 *
 * The npm script loads .env via Node's built-in --env-file.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// The explicit .ts extension lets Node run this file directly via type
// stripping (see the "seed:admin" script in package.json).
import "../app/models/User.ts";
import { connectDB } from "../app/lib/mongodb.ts";

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

type AdminDocument = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
};

type UserCollection = {
  findOne(filter: { email: string }): Promise<unknown>;
  create(data: AdminDocument & { password: string }): Promise<unknown>;
};

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed an admin.`);
  }

  return value;
}

async function seedAdmin(): Promise<void> {
  const name = required("ADMIN_NAME");
  const email = required("ADMIN_EMAIL").toLowerCase();
  const password = required("ADMIN_PASSWORD");
  const phone = required("ADMIN_PHONE");
  const address = required("ADMIN_ADDRESS");

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  // Reuse the app's connection helper so the seed script gets the same
  // MONGODB_URI validation, DNS configuration and retry behaviour.
  await connectDB();

  const users = mongoose.models.User as unknown as UserCollection;

  if (!users) {
    throw new Error("The User model is not registered.");
  }

  const existing = await users.findOne({ email });

  if (existing) {
    console.log(`Admin already exists for ${email}. Nothing to do.`);

    await mongoose.disconnect();

    return;
  }

  await users.create({
    name,
    email,
    password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
    phone,
    address,
    role: "admin",
  });

  console.log(`Admin created for ${email}.`);

  await mongoose.disconnect();
}

seedAdmin().catch((error: unknown) => {
  console.error("Admin seed failed:", error);

  process.exitCode = 1;
});
