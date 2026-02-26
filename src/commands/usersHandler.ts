import { User } from "src/lib/db/schema.js";
import { readConfig, setUser } from "../config.js";
import {
  createUser,
  deleteAllUsers,
  getAllUsers,
  getUserByName,
} from "src/lib/db/queries/users.js";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage: ${cmdName} <username>`);
  }
  const userName = args[0];
  const exists = await getUserByName(userName);
  if (!exists) {
    throw new Error(
      `User with ${userName} does not exist. Please register first.`
    );
  }
  setUser(userName);
  console.log(`User set as: ${userName}`);
}
export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage: ${cmdName} <username>`);
  }
  const userName = args[0];
  const exists = await getUserByName(userName);
  if (exists) {
    throw new Error(`User with ${userName} already exists.`);
  }
  const user = await createUser(userName);
  if (!user) {
    throw new Error(`Failed to create user with name ${userName}.`);
  }
  setUser(userName);
  console.log(
    `User created with the following data: ${user.id} ${user.name} ${user.createdAt}`
  );
}
export async function handlerGetUsers(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`Usage: ${cmdName} <no arguments>`);
  }
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  const config = readConfig();
  for (const user of users) {
    const isCurrentUser = user.name === config.currentUserName;
    console.log(`${user.name}${isCurrentUser ? " (current)" : ""}`);
  }
}

export async function handlerDeleteAll(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`Usage: ${cmdName} (no arguments)`);
  }
  await deleteAllUsers();
  console.log("All users have been deleted.");
}
