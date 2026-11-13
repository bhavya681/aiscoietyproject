/**
 * Creates the first admin account and its society.
 *
 * Signup always creates residents, so the very first admin has to be
 * bootstrapped. Run it once:
 *
 *   npm run seed:admin
 *
 * Configure it with environment variables (never commit them):
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE, ADMIN_ADDRESS
 *   ADMIN_SOCIETY_NAME (optional, defaults to "Palm Grove Residency")
 *
 * The npm script loads .env via Node's built-in --env-file.
 */

import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// The explicit .ts extension lets Node run this file directly via type
// stripping (see the "seed:admin" script in package.json).
import Membership from "../app/models/Membership.ts";
import Society from "../app/models/Society.ts";
import User from "../app/models/User.ts";
import { connectDB } from "../app/lib/mongodb.ts";

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_SOCIETY_NAME = "Palm Grove Residency";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "society";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);

  let candidate = base;
  let suffix = 1;

  while (await Society.exists({ slug: candidate })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function uniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomBytes(4).toString("hex").toUpperCase();

    if (!(await Society.exists({ inviteCode: code }))) {
      return code;
    }
  }

  throw new Error("Could not allocate a unique invite code.");
}

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
  const societyName =
    process.env.ADMIN_SOCIETY_NAME?.trim() || DEFAULT_SOCIETY_NAME;

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  // Reuse the app's connection helper so the seed script gets the same
  // MONGODB_URI validation, DNS configuration and retry behaviour.
  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
      phone,
      address,
      role: "admin",
    });

    console.log(`Admin created for ${email}.`);
  } else {
    console.log(`Admin already exists for ${email}. Ensuring society access.`);
  }

  let society = await Society.findOne({ createdBy: user._id });

  if (!society) {
    society = await Society.create({
      name: societyName,
      slug: await uniqueSlug(societyName),
      inviteCode: await uniqueCode(),
      address,
      createdBy: user._id,
    });

    console.log(`Society created: ${society.name} (${society.inviteCode}).`);
  }

  const membership = await Membership.findOne({
    userId: user._id,
    societyId: society._id,
  });

  if (!membership) {
    await Membership.create({
      userId: user._id,
      societyId: society._id,
      role: "owner",
      status: "active",
    });
  }

  if (!user.activeSocietyId) {
    user.activeSocietyId = society._id;
    await user.save();
  }

  await mongoose.disconnect();

  console.log(
    `Admin ${email} is the owner of ${society.name}. Invite code: ${society.inviteCode}`
  );
}

seedAdmin().catch((error: unknown) => {
  console.error("Admin seed failed:", error);

  process.exitCode = 1;
});