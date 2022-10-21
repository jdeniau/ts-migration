import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const POSSIBLE_EXTENSIONS = ['', '.ts', '.tsx', '.js', '.jsx'];

type FilesPerType = {
  externalImports: string[];
  jsImports: string[];
  tsImports: string[];
};

export function extractNumberOfFilePerType(filePath: string): FilesPerType {
  const file = fs.readFileSync(path.resolve(filePath), 'utf8');
  // parse the given file with typescript parser
  const mySourceFile = ts.createSourceFile(
    filePath,
    // undefined,
    file,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  // console.log(ast);

  if (!mySourceFile) {
    throw new Error('Source file not found');
  }

  const importNodes: ts.Node[] = [];

  ts.forEachChild(mySourceFile, (node) => {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      importNodes.push(node);
    }
  });

  // determine if a node is a TS or a JS import
  const initialValue: FilesPerType = {
    externalImports: [],
    jsImports: [],
    tsImports: [],
  };

  return importNodes.reduce(
    (carry: FilesPerType, node: ts.Node): FilesPerType => {
      if (node.kind === ts.SyntaxKind.ImportDeclaration) {
        const importDeclaration = node as ts.ImportDeclaration;
        const fileEnd = importDeclaration.moduleSpecifier
          .getText()
          .replace(/['"]/g, '');

        if (!fileEnd.startsWith('.')) {
          return {
            ...carry,
            externalImports: [...carry.externalImports, fileEnd],
          };
        }

        const fullPath = path.resolve(path.dirname(filePath), fileEnd);

        let nameWithExtension;

        for (const extension of POSSIBLE_EXTENSIONS) {
          if (fs.existsSync(fullPath + extension)) {
            nameWithExtension = fullPath + extension;
            break;
          }
        }

        if (!nameWithExtension) {
          return carry;
        }

        if (
          path.extname(nameWithExtension) === '.ts' ||
          path.extname(nameWithExtension) === '.tsx'
        ) {
          return {
            ...carry,
            tsImports: [...carry.tsImports, nameWithExtension],
          };
        } else {
          return {
            ...carry,
            jsImports: [...carry.jsImports, nameWithExtension],
          };
        }
      }

      return carry;
    },
    initialValue
  );
}
