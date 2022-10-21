import path from 'path';
import fs from 'fs';
import { extractNumberOfFilePerType } from './extractNumberOfFilePerType.mjs';
import { FileImports } from './FileImports.mjs';
import { generateHtml } from './template.mjs';

// extract DIR and FILE_DIR from args
const [DIR, FILE_DIR] = process.argv.slice(2);

if (!DIR) {
  throw new Error('DIR argument is required');
}

function getFileNumberOfLines(filePath: string): number {
  const file = fs.readFileSync(path.resolve(filePath), 'utf8');
  return file.split(/\n/).length;
}

type FileWithLoc = {
  filePath: string;
  loc: number;
};

function getFiles(dir: string, files_: FileWithLoc[] = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const name = path.join(dir, file.name);

    // ignore .git and node_modules directory
    if (
      file.isDirectory() &&
      (file.name === '.git' || file.name === 'node_modules')
    ) {
      console.log(`Ignoring ${name}`);
      continue;
    }

    if (file.isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push({ filePath: name, loc: getFileNumberOfLines(name) });
    }
  }
  return files_;
}

const numberOfImportsPerFile: FileImports[] = [];

console.log(`Getting files from ${path.resolve(DIR, FILE_DIR ?? '')}...`);

getFiles(path.resolve(DIR, FILE_DIR ?? ''))
  .filter(
    (file) =>
      file.filePath.endsWith('.js') ||
      file.filePath.endsWith('.ts') ||
      file.filePath.endsWith('.tsx') ||
      file.filePath.endsWith('.jsx')
  )
  .forEach((file) => {
    const numberOfImports = extractNumberOfFilePerType(file.filePath);

    const fileImports = new FileImports(
      file.filePath.replace(DIR, '').replace(/^\/+/, ''),
      file.loc,
      numberOfImports.externalImports,
      numberOfImports.jsImports,
      numberOfImports.tsImports
    );

    numberOfImportsPerFile.push(fileImports);
  });

// fs.writeFileSync(
//   path.resolve('src/numberOfImportsPerFile.json'),
//   JSON.stringify(numberOfImportsPerFile.sort(FileImports.sort), null, 2)
// );

const html = generateHtml(numberOfImportsPerFile.sort(FileImports.sort), DIR);

fs.mkdirSync(path.resolve('public'), { recursive: true });
fs.writeFileSync(path.resolve('public/index.html'), html);
