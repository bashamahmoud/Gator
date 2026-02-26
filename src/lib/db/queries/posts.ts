import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, NewPost, posts } from "../schema";

export async function createPost(post: NewPost) {
  const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({ target: posts.url });
  return result;
}
export async function getPostsForUser(userId: string, limit: number) {
  const results = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return results;
}
