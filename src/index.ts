import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands/commands.js";
import {
  handlerDeleteAll,
  handlerGetUsers,
  handlerLogin,
  handlerRegister,
} from "./commands/usersHandler.js";
import { handlerAgg } from "./commands/agg.js";
import { handlerAddFeed, handlerGetFeeds } from "./commands/feeds.js";
import {
  handlerFeedFollow,
  handlerFollowing,
  unFollowFeed,
} from "./commands/feedFollows.js";
import { middlewareLoggedIn } from "./middleware.js";
import { handlerBrowse } from "./commands/browse.js";
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: npm run start <command> [args...]");
    process.exit(1);
  }
  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandsRegistry = {};
  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);
  registerCommand(commandsRegistry, "reset", handlerDeleteAll);
  registerCommand(commandsRegistry, "users", handlerGetUsers);
  registerCommand(commandsRegistry, "agg", handlerAgg);
  registerCommand(
    commandsRegistry,
    "addfeed",
    middlewareLoggedIn(handlerAddFeed)
  );
  registerCommand(commandsRegistry, "feeds", handlerGetFeeds);
  registerCommand(
    commandsRegistry,
    "follow",
    middlewareLoggedIn(handlerFeedFollow)
  );
  registerCommand(
    commandsRegistry,
    "following",
    middlewareLoggedIn(handlerFollowing)
  );
  registerCommand(
    commandsRegistry,
    "unfollow",
    middlewareLoggedIn(unFollowFeed)
  );
  registerCommand(
    commandsRegistry,
    "browse",
    middlewareLoggedIn(handlerBrowse)
  );

  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error ${cmdName}: ${error.message}`);
    } else {
      console.error(`Error ${cmdName}: ${error}`);
    }
    process.exit(1);
  }
  process.exit(0);
}
main();
