import NextI18Next from './types';
import { Handler } from 'express';

declare function nextI18NextMiddleware(nexti18next: NextI18Next): Handler[];

export default nextI18NextMiddleware;
