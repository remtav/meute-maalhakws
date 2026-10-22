import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const nouvelles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nouvelles' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    epingle: z.boolean().optional().default(false),
    image: z.string().optional().nullable(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    titre: z.string(),
  }),
});

export const collections = { nouvelles, pages };
