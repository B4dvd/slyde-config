import { unlinkSync } from 'fs';
import { resolve } from 'path';

const combinedPath = resolve(__dirname, './slyde-config/config.' + process.env.NODE_ENV + '.public.json');
unlinkSync(combinedPath);