import { YahooCategorySchema } from '@/server/api/v1/yahoo/schema';
import { createResultSchema } from '@/server/schema';

export const YahooCategoryResultSchema = createResultSchema(
  YahooCategorySchema.array(),
);
