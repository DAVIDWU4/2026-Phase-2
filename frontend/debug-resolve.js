import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const resolve = await import('node:module').then(m => m.createRequire(import.meta.url));
console.log('vitest resolved to', resolve.resolve('vitest'));
console.log('vitest dist path exists', await import('node:fs/promises').then(fs => fs.access(resolve.resolve('vitest')).then(() => true).catch(() => false)));
