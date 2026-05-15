import { documentsApi } from './documents.api';
import { aiApi } from './ai.api';
import { authApi } from './auth.api';

export const api = {
  ...aiApi,
  ...documentsApi,
  ...authApi,
};