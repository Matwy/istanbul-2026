import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days' }),
  schema: z.object({
    order: z.number(),
    date: z.string(),
    weekday: z.string(),
    title: z.string(),
    subtitle: z.string(),
    color: z.string(),
    stopIds: z.array(z.string()),
  }),
});

const attractions = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/attractions' }),
  schema: z.object({
    name: z.string(),
    turkishName: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    priceEur: z.number().nullable(),
    priceTl: z.number().nullable(),
    bookOnline: z.boolean(),
    notes: z.string(),
    shortDesc: z.string().optional(),
    dayId: z.string().optional(),
    category: z.enum(['must', 'optional']),
    emoji: z.string().optional(),
    image: z.string().nullable().optional(),
  }),
});

const dishes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/dishes' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    badges: z.array(z.string()),
    emoji: z.string(),
    image: z.string().nullable().optional(),
    order: z.number(),
  }),
});

const neighborhoods = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/neighborhoods' }),
  schema: z.object({
    name: z.string(),
    side: z.enum(['europea', 'asiatica']),
    description: z.string(),
    tags: z.array(z.string()),
    order: z.number(),
  }),
});

const transports = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/transports' }),
  schema: z.object({
    name: z.string(),
    turkishName: z.string().optional(),
    icon: z.string(),
    description: z.string(),
    tips: z.string(),
    order: z.number(),
  }),
});

const checklist = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/checklist' }),
  schema: z.object({
    title: z.string(),
    icon: z.string(),
    order: z.number(),
    items: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        note: z.string().optional(),
      })
    ),
  }),
});

export const collections = { days, attractions, dishes, neighborhoods, transports, checklist };
