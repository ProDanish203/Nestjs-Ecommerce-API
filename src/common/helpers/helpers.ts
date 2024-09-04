import { Document, PaginateModel, PaginateOptions } from 'mongoose';
import { UserDocument } from 'src/database/User.schema';

interface PaginationParams<T extends Document> {
  model: PaginateModel<T>;
  page?: number;
  limit?: number;
  query?: Record<string, any>;
  populate?: string | object | any;
  select?: string;
  sort?: object;
}

export const getPaginatedData = async <T extends Document>({
  model,
  page = 1,
  limit = 10,
  query = {},
  populate,
  select = '-password',
  sort = { createdAt: -1 },
}: PaginationParams<T>) => {
  const options: PaginateOptions = {
    select,
    sort,
    page,
    limit,
    populate,
    lean: true,
    customLabels: {
      totalDocs: 'totalItems',
      docs: 'data',
      limit: 'perPage',
      page: 'currentPage',
      meta: 'pagination',
    },
  };

  const { docs: data, ...pagination } = await model.paginate(query, options);

  return { data, pagination };
};
