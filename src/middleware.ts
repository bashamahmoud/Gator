import { User } from "./lib/db/schema";
import { CommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (
  handler: UserCommandHandler
) => CommandHandler;

export function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) {
      throw new Error(
        `You must be logged in to run the command ${cmdName}. Please use the login command first.`
      );
    }
    const user = await getUserByName(config.currentUserName);
    if (!user) {
      throw new Error(
        `Current user ${config.currentUserName} not found in database. Please use the login command first.`
      );
    }
    await handler(cmdName, user, ...args);
  };
}
