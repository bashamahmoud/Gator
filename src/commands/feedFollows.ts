import {
  createFeedFollow,
  getFeedByUrl,
  getFeedFollowsForUser,
  unFollowFeedForUser,
} from "src/lib/db/queries/feeds";
import { getUserByName } from "src/lib/db/queries/users";
import { User } from "src/lib/db/schema";

export async function handlerFeedFollow(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error(`Usage: ${cmdName} <feedUrl>`);
  }
  const feedUrl = args[0];
  const feed = await getFeedByUrl(feedUrl);
  if (!feed) {
    throw new Error(
      `Feed with url ${feedUrl} not found. Please add the feed first.`
    );
  }
  const feedFollow = await createFeedFollow(feed.id, user.id);
  if (!feedFollow) {
    throw new Error(`Failed to follow feed with url ${feedUrl}.`);
  }
  printFeedFollow(feedFollow.userName, feedFollow.feedName);
}
export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 0) {
    throw new Error(`Usage: ${cmdName} <no arguments>`);
  }
  const feedFollows = await getFeedFollowsForUser(user.id);
  if (feedFollows.length === 0) {
    console.log(`User ${user.name} is not following any feeds.`);
    return;
  }
  console.log(`User ${user.name} is following the following feeds:`);
  for (const feedFollow of feedFollows) {
    console.log(`- ${feedFollow.feeds.name})`);
  }
}
export async function unFollowFeed(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length !== 1) {
    throw new Error(`Usage: ${cmdName} <feedUrl>`);
  }
  const feedUrl = args[0];
  const feed = await getFeedByUrl(feedUrl);
  if (!feed) {
    throw new Error(
      `Feed with url ${feedUrl} not found. Please add the feed first.`
    );
  }
  await unFollowFeedForUser(feed.id, user.id);
}

export function printFeedFollow(userName: string, feedName: string) {
  console.log(`User ${userName} is now following feed ${feedName}.`);
}
