import path from 'path';
import fs from 'fs';
import { extractNumberOfFilePerType } from './extractNumberOfFilePerType.mjs';
import { FileImports } from './FileImports.mjs';
import { generateHtml, Section } from './template.mjs';

// extract DIR and FILE_DIRS from args
const [DIR, ...FILE_DIRS] = process.argv.slice(2);

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

function getFileImports(fileDir: string): FileImports[] {
  console.log(`Getting files from ${path.resolve(DIR, fileDir)}...`);

  return getFiles(path.resolve(DIR, fileDir))
    .filter(
      (file) =>
        file.filePath.endsWith('.js') ||
        file.filePath.endsWith('.ts') ||
        file.filePath.endsWith('.tsx') ||
        file.filePath.endsWith('.jsx')
    )
    .map((file) => {
      const numberOfImports = extractNumberOfFilePerType(file.filePath);

      return new FileImports(
        file.filePath.replace(DIR, '').replace(/^\/+/, ''),
        file.loc,
        numberOfImports.externalImports,
        numberOfImports.jsImports,
        numberOfImports.tsImports
      );
    })
    .sort(FileImports.sort);
}

const sections: Section[] = (FILE_DIRS.length > 0 ? FILE_DIRS : ['']).map(
  (fileDir) => ({ dir: fileDir, fileImports: getFileImports(fileDir) })
);

// fs.writeFileSync(
//   path.resolve('src/numberOfImportsPerFile.json'),
//   JSON.stringify(sections, null, 2)
// );

const html = generateHtml(sections, DIR);

fs.mkdirSync(path.resolve('public'), { recursive: true });
fs.writeFileSync(path.resolve('public/index.html'), html);
