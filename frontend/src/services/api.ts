import { documentsApi } from './documents.api';
import { aiApi } from './ai.api';

export const api = {
  ...aiApi,
  ...documentsApi,
};