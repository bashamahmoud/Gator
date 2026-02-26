import { and, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId: userId })
    .returning();
  return result;
}
export async function getAllFeeds() {
  const result = await db.select().from(feeds);
  return result;
}
export async function getFeedByUrl(URL: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, URL));
  return result;
}

export async function createFeedFollow(feedId: string, userId: string) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ feedId: feedId, userId: userId })
    .returning();
  const [AllFeeds] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(
      and(
        eq(feedFollows.id, newFeedFollow.id),
        eq(feedFollows.userId, newFeedFollow.userId)
      )
    );
  return AllFeeds;
}
export async function getFeedFollowsForUser(userId: string) {
  const results = await db
    .select()
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
  return results;
}
export async function unFollowFeedForUser(feedId: string, userId: string) {
  await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.feedId, feedId), eq(feedFollows.userId, userId)));
}
export async function markFeedFetched(feedId: string) {
  const result = await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
    })
    .where(eq(feeds.id, feedId))
    .returning();
}
export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt}  ASC NULLS FIRST`)
    .limit(1);
  return result[0];
}
