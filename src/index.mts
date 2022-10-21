import path from 'path';
import fs from 'fs';
import { extractNumberOfFilePerType } from './extractNumberOfFilePerType.mjs';

const DIR = '/home/jdeniau/code/desk/src';

// const filePath = '../desk/src/reducers/customers.js';
const filePath = '/reducers/index.js';

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

    if (file.isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push({ filePath: name, loc: getFileNumberOfLines(name) });
    }
  }
  return files_;
}

// find all JS/TS files recursivelly in the given directory  using node API

// const files = fs
//   .readdirSync(DIR)
//   .filter((file) => {
//     const ext = path.extname(file);
//     return ['.js', '.ts', '.tsx', '.jsx'].includes(ext);
//   })
//   .map((file) => path.join(DIR, file));

// const files = glob.sync(`${DIR}/**/*.{ts,tsx,js,jsx}`);

// console.log(files);

class FileImports {
  fileName: string;
  loc: number;
  externalImports: string[];
  jsImports: string[];
  tsImports: string[];

  constructor(
    fileName: string,
    loc: number,
    externalImports: string[],
    jsImports: string[],
    tsImports: string[]
  ) {
    this.fileName = fileName;
    this.loc = loc;
    this.externalImports = externalImports;
    this.jsImports = jsImports;
    this.tsImports = tsImports;
  }

  isJs() {
    return this.fileName.endsWith('.js') || this.fileName.endsWith('.jsx');
  }

  isTs() {
    return this.fileName.endsWith('.ts') || this.fileName.endsWith('.tsx');
  }

  /**
   * This will sort the imports in the following order:
   * - js files first
   * - fewer js imports
   * - fewer ts imports
   * - fewer external imports
   * - file without 'react' import first
   * - file with the fewer line number
   */
  static sort(a: FileImports, b: FileImports) {
    if (a.isJs() && !b.isJs()) {
      return -1;
    } else if (!a.isJs() && b.isJs()) {
      return 1;
    }

    const jsDiff = a.jsImports.length - b.jsImports.length;
    if (jsDiff !== 0) {
      return jsDiff;
    }

    const tsDiff = a.tsImports.length - b.tsImports.length;
    if (tsDiff !== 0) {
      return tsDiff;
    }

    const externalDiff = a.externalImports.length - b.externalImports.length;
    if (externalDiff !== 0) {
      return externalDiff;
    }

    if (
      a.externalImports.includes('react') &&
      !b.externalImports.includes('react')
    ) {
      return 1;
    } else if (
      !a.externalImports.includes('react') &&
      b.externalImports.includes('react')
    ) {
      return -1;
    }

    return a.loc - b.loc;
  }
}

const numberOfImportsPerFile: FileImports[] = [];

getFiles(DIR)
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
      file.filePath,
      file.loc,
      numberOfImports.externalImports,
      numberOfImports.jsImports,
      numberOfImports.tsImports
    );

    numberOfImportsPerFile.push(fileImports);
  });

fs.writeFileSync(
  path.resolve('src/numberOfImportsPerFile.json'),
  JSON.stringify(numberOfImportsPerFile.sort(FileImports.sort), null, 2)
);
