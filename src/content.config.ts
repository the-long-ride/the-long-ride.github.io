import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
const category = z.enum(["ai", "developer-tools", "product", "local-first"]);
const common = {
  title: z.string().min(1),
  slug: z.string().min(1),
  problem: z.string().min(1),
  value: z.string().min(1),
  summary: z.string().min(1),
  category,
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  repo: z.url(),
  homepage: z.url().optional(),
  demo: z.url().optional(),
  docs: z.url().optional(),
  logo: z
    .string()
    .regex(/^\/projects\/[a-z0-9-]+\/logo\.(png|svg)$/)
    .optional(),
  featuredOrder: z.number().int().positive().optional(),
  deepDive: z.boolean().default(false),
};
const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    ...common,
    status: z.literal("released"),
    releaseState: z.literal("released"),
    featured: z.boolean().default(false),
  }),
});
const lab = defineCollection({
  loader: glob({ base: "./src/content/lab", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    ...common,
    status: z.literal("in-development"),
    releaseState: z.literal("unreleased"),
    featured: z.literal(false),
  }),
});
const writing = defineCollection({
  loader: glob({ base: "./src/content/writing", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    language: z.string().default("en"),
    draft: z.boolean().default(false),
  }),
});
export const collections = { projects, lab, writing };
