import {
  createFeed,
  createFeedFollow,
  getAllFeeds,
} from "src/lib/db/queries/feeds";
import { getUserById } from "src/lib/db/queries/users";
import { Feed, User } from "src/lib/db/schema";
import { printFeedFollow } from "./feedFollows";

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 2) {
    throw new Error(`Usage: ${cmdName} <feed_url> <url>`);
  }
  const feedName = args[0];
  const feedUrl = args[1];

  const feed = await createFeed(feedName, feedUrl, user.id);
  if (!feed) {
    throw new Error(
      `Failed to create feed with name ${feedName} and url ${feedUrl}.`
    );
  }
  const follow = await createFeedFollow(feed.id, user.id);
  printFeedFollow(user.name, follow.feedName);
  console.log(`Feed created with the following data:`);

  printFeed(feed, user);
}
export async function handlerGetFeeds(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`Usage: ${cmdName} <no arguments>`);
  }
  const feeds = await getAllFeeds();
  if (feeds.length === 0) {
    console.log("No feeds found.");
    return;
  }
  for (const feed of feeds) {
    const user = await getUserById(feed.userId);
    if (!user) {
      console.log(
        `Feed ${feed.name} has an invalid user_id ${feed.userId}. Skipping...`
      );
      continue;
    }
    printFeed(feed, user);
  }
}

function printFeed(feed: Feed, user: User) {
  console.log(`ID:            ${feed.id}`);
  console.log(`name:          ${feed.name}`);
  console.log(`URL:           ${feed.url}`);
  console.log(`User:          ${user.name}`);
  console.log(`Created:       ${feed.createdAt}`);
  console.log(`Updated:       ${feed.updatedAt}`);
}
