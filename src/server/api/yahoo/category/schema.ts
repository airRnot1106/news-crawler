import { YahooCategorySchema } from '@/server/api/yahoo/schema';
import { createResultSchema } from '@/server/schema';

export const YahooCategoryResultSchema = createResultSchema(
  YahooCategorySchema.array(),
);
