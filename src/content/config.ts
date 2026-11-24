import { defineCollection, z } from 'astro:content';

// 與 public/admin/config.yml 的 collections 對應，網站開發時可直接 getCollection('pages')。
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

// 全站設定（YAML，由 CMS 的 settings collection 維護）。
const settings = defineCollection({
  type: 'data',
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
