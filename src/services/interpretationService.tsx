// services/interpretationService.ts
import axios from '../lib/axios';
import { InterpretationResponseDto } from '../types/interpretation';

export const interpretationService = {
  getDetailBySessionId: async (sessionId: number) => {
    // API mà ông giáo vừa đưa ở trên đấy
    const response = await axios.get<InterpretationResponseDto>(`/v1/interpretations/${sessionId}`);
    console.log(response)
    return response.data;
  }
};