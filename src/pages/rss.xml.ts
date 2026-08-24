import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteConfig } from "../config/site";
export async function GET(context: { site?: URL }) {
  const posts = (await getCollection("writing", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
  return rss({
    title: `${siteConfig.name} — Writing`,
    description: "Notes on software, AI tooling, developer tools, and engineering decisions.",
    site: context.site ?? new URL(siteConfig.url),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/writing/${post.data.slug}/`,
    })),
  });
}
