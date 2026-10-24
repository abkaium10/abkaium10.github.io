import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const available = existsSync(resolve('public/cv.pdf'));
const status = { available, path: available ? '/cv.pdf' : null };
writeFileSync(resolve('lib/cv-status.json'), JSON.stringify(status, null, 2) + '\n');
writeFileSync(resolve('lib/cv-status.js'), `const CV_STATUS = ${JSON.stringify(status)};\nexport default CV_STATUS;\n`);
console.log(available ? 'CV attachment found: public/cv.pdf' : 'No CV attachment found; terminal will report no attachment.');
