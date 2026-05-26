import { PaginatedResult } from '../types/index.js';

export function parsePagination(query: { cursor?: string; limit?: string }): {
  cursor: string | undefined;
  limit: number;
} {
  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10) || 20, 1), 100);
  return { cursor: query.cursor, limit };
}

export function paginatedResult<T>(
  data: T[],
  limit: number,
  total?: number,
): PaginatedResult<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const lastItem = items[items.length - 1];

  return {
    data: items,
    cursor: hasMore && lastItem ? (lastItem as Record<string, unknown>).id as string : null,
    hasMore,
    total,
  };
}
