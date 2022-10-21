import { FileImports } from './FileImports.mjs';

export function generateHtml(fileImports: FileImports[]): string {
  const nbTs = fileImports.filter((file) => file.isTs()).length;

  const percentageTs = ((100 * nbTs) / fileImports.length).toFixed(0);

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    
    <title>TS Migration</title>
    <meta name="description" content="Tool to help you choose which file should be migrated to TS first in a project "/>
    <meta name="theme-color" content="#000000"/>
    
    <link rel="icon" href="/behat-logs/favicon.ico"/>
    <link rel="apple-touch-icon" href="/behat-logs/logo192.png"/>
    <link rel="manifest" href="/behat-logs/manifest.json"/>
    <link href="/index.css" rel="stylesheet">
  </head>
  
  <body>
    <div id="root">
      <div class="App App--finished">
        <h1>TS Migration</h1>
        <h2 class="mt0">${nbTs} / ${fileImports.length} (${percentageTs}%)</h2>
        <main class="HeatMap">
        ${fileImports
          .map((fileImport) => {
            const tooltip = [
              fileImport.fileName,
              `${fileImport.jsImports.length} JS imports`,
              `${fileImport.tsImports.length} TS imports`,
              `${fileImport.externalImports.length} external imports`,
              `${fileImport.loc} lines`,
            ].join('\n');

            return `<a
                href="#${fileImport.fileName}"
                class="Test Test--${fileImport.isJs() ? 'js' : 'ts'}"
                title="${fileImport.fileName}"
                data-tooltip="${tooltip}"
              >
                ${fileImport.fileName}
              </a>`;
          })
          .join('\n')}
        </main>
      </div>
    </div>

    <script src="/index.js"></script>
  </body>
</html>
`;
}
