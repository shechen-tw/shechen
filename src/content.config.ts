import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 與 public/admin/config.yml 的 collections 對應，網站開發時可直接 getCollection('pages')。
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

// 全站設定（YAML，由 CMS 的 settings collection 維護）。
const settings = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/settings' }),
  schema: z.object({
    site_title: z.string(),
    site_description: z.string().optional(),
    contact_email: z.string().optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { pages, settings };
