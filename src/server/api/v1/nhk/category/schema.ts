import { NHKCategorySchema } from '@/server/api/v1/nhk/schema';
import { createResultSchema } from '@/server/schema';

export const NHKCategoryResultSchema = createResultSchema(
  NHKCategorySchema.array(),
);
