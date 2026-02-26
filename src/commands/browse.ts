import { getPostsForUser } from "src/lib/db/queries/posts";
import { User } from "src/lib/db/schema";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  let limit = 2;
  if (args.length === 1) {
    limit = parseInt(args[0]);
    if (isNaN(limit) || limit <= 0) {
      throw new Error(`Usage: ${cmdName} <limit (optional, default=2)>`);
    }
  }
  const posts = await getPostsForUser(user.id, limit);
  if (posts.length === 0) {
    console.log(`No posts found for user ${user.name}.`);
    return;
  }
  console.log(`Showing ${posts.length} posts for user ${user.name}:`);
  for (const post of posts) {
    console.log(`${post.publishedAt} --- ${post.title}`);
    console.log(`Link: ${post.url}`);
    console.log(`=====================================`);
  }
}
