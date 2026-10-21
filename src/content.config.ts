import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One Markdown file per work in src/content/works; cards are sorted by `order`.
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    order: z.number(),
    kind: z.string(),
    title: z.string(),
    tags: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
  }),
});

export const collections = { works };
