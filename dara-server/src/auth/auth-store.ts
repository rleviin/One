import bcrypt from "bcryptjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import { randomUUID } from "crypto";

export type DaraUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

const dbPath = path.join(process.cwd(), "data", "users.json");

function readUsers(): DaraUser[] {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath, "utf8")) as DaraUser[];
}

function writeUsers(users: DaraUser[]) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

function createToken(user: DaraUser) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");

  return jwt.sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn: "30d" }
  );
}

export async function signupUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === cleanEmail)) {
    throw new Error("Email already registered");
  }

  const user: DaraUser = {
    id: randomUUID(),
    email: cleanEmail,
    name: name.trim() || "Dara user",
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);

  return {
    token: createToken(user),
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const user = readUsers().find((item) => item.email === cleanEmail);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  return {
    token: createToken(user),
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");

  return jwt.verify(token, secret);
}
