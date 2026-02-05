import axios from '../lib/axios';
import { ReadingSession, PageResponse } from '../types/readingSession';

const API_BASE_URL = '/v1/sessions';

export const sessionService = {
  /**
   * Lấy danh sách phiên có phân trang và lọc
   * @param tab: 'live' | 'completed' | 'dispute'
   * @param page: số trang (bắt đầu từ 0)
   * @param size: số lượng phần tử trên 1 trang
   * @param sort: định dạng "fieldName,direction" (VD: "createdAt,desc")
   */
  getAllSessions: async (
    tab?: string,
    page: number = 0,
    size: number = 5,
    sort: string = 'createdAt,desc'
  ): Promise<PageResponse<ReadingSession>> => {
    const response = await axios.get<PageResponse<ReadingSession>>(API_BASE_URL, {
      params: {
        tab: tab,
        page: page,
        size: size,
        sort: sort
      }
    });
    return response.data;
  }
};