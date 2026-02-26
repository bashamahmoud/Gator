import { getNextFeedToFetch, markFeedFetched } from "src/lib/db/queries/feeds";
import { createPost } from "src/lib/db/queries/posts";
import { fetchFeed } from "src/lib/db/rss";
import { Feed, NewPost } from "src/lib/db/schema";

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`Usage: ${cmdName} <time_between_reqs>`);
  }
  const timeBetweenReqs = parseDuration(args[0]);
  console.log(`Collecting feeds every ${args[0]}`);
  scrapeFeeds().catch(handleError);

  // Start interval loop
  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenReqs);

  // Wait for Ctrl+C
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(
      `Invalid duration format: ${durationStr}. Expected format is a number followed by ms, s, m, or h (e.g., 500ms, 10s, 5m, 1h).`
    );
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}
async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) {
    console.log(`No feeds to fetch.`);
    return;
  }
  await markFeedFetched(feed.id);

  const feedData = await fetchFeed(feed.url);
  for (let item of feedData.channel.item) {
    const now = new Date();

    await createPost({
      url: item.link,
      feedId: feed.id,
      title: item.title,
      createdAt: now,
      updatedAt: now,
      description: item.description,
      publishedAt: new Date(item.pubDate),
    } satisfies NewPost);
  }
}
function handleError(err: unknown) {
  if (err instanceof Error) {
    console.error("Error scraping feeds:", err.message);
    console.error("Stack:", err.stack);
  } else {
    console.error("Error scraping feeds:", err);
  }
}
