import { NHKCategorySchema } from '@/server/api/nhk/schema';
import { createResultSchema } from '@/server/schema';

export const NHKCategoryResultSchema = createResultSchema(
  NHKCategorySchema.array(),
);
