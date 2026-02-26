import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string) {
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
      accept: "application/rss+xml",
    },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch RSS feed: ${res.status} ${res.statusText}`
    );
  }
  const xmlText = await res.text();
  const parser = new XMLParser();
  let feed = parser.parse(xmlText);

  const channel = feed.rss?.channel;
  if (!channel) {
    throw new Error("Missing channel element");
  }
  if (!channel.title || !channel.link || !channel.description) {
    throw new Error("Missing required channel fields");
  }
  const items: any[] = Array.isArray(channel.item)
    ? channel.item
    : [channel.item];
  const validItems: RSSItem[] = [];
  for (const item of items) {
    if (!item.title || !item.link || !item.description || !item.pubDate) {
      continue;
    }

    validItems.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }
  const rssFeed: RSSFeed = {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: validItems,
    },
  };
  return rssFeed;
}
