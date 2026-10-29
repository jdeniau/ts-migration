import { FileImports } from './FileImports.mjs';

export type Section = {
  dir: string;
  fileImports: FileImports[];
};

function formatProgress(fileImports: FileImports[]): string {
  const nbTs = fileImports.filter((file) => file.isTs()).length;

  const percentageTs =
    fileImports.length > 0
      ? ((100 * nbTs) / fileImports.length).toFixed(2)
      : '0.00';

  return `${nbTs} / ${fileImports.length} (${percentageTs}%)`;
}

// "packages/form-builder/src" => "form-builder"
function formatTabName(dir: string): string {
  return dir.replace(/^(apps|packages)\//, '').replace(/\/src$/, '');
}

function generateHeatMap(fileImports: FileImports[]): string {
  return fileImports
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
          class="File File--${fileImport.isJs() ? 'js' : 'ts'}${
            fileImport.isTest() ? ' File--test' : ''
          }"
          title="${fileImport.fileName}"
          data-tooltip="${tooltip}"
          data-copy="${fileImport.fileName}"
        >
          ${fileImport.fileName}
        </a>`;
    })
    .join('\n');
}

export function generateHtml(sections: Section[], dir: string): string {
  const allFileImports = sections.flatMap((section) => section.fileImports);
  const hasTabs = sections.length > 1;

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
    <link href="./index.css" rel="stylesheet">
  </head>

  <body>
    <div id="root">
      <div class="App App--finished">
        <h1>TS Migration for "${dir}"</h1>
        <div class="Summary">
          <h2>${formatProgress(allFileImports)}</h2>
          <div class="Legend">
            <ul class="LegendItems">
              <li><span class="LegendSwatch File--js"></span>JS</li>
              <li><span class="LegendSwatch File--ts"></span>TS</li>
              <li><span class="LegendSwatch File--js File--test"></span>JS test</li>
              <li><span class="LegendSwatch File--ts File--test"></span>TS test</li>
            </ul>
            <em>Press "i" to mark a file as "ignored" (locally)</em>
          </div>
        </div>
        <main class="Sections">
        ${
          hasTabs
            ? `<div class="Tabs" role="tablist">
              ${sections
                .map(
                  (section, index) => `<button
                    type="button"
                    class="Tab${index === 0 ? ' Tab--active' : ''}"
                    role="tab"
                    id="tab-${index}"
                    aria-controls="section-${index}"
                    aria-selected="${index === 0}"
                    data-tab="${section.dir}"
                    title="${section.dir}"
                  >
                    <span class="TabName">${formatTabName(section.dir)}</span>
                    <span class="TabProgress">${formatProgress(
                      section.fileImports
                    )}</span>
                  </button>`
                )
                .join('\n')}
            </div>`
            : ''
        }
        ${sections
          .map(
            (section, index) => `<section
              class="Section"
              id="section-${index}"
              ${
                hasTabs
                  ? `role="tabpanel" aria-labelledby="tab-${index}"`
                  : ''
              }
              ${index === 0 ? '' : 'hidden'}
            >
              <div class="HeatMap">
                ${generateHeatMap(section.fileImports)}
              </div>
            </section>`
          )
          .join('\n')}
        </main>
      </div>
    </div>

    <script src="./index.js"></script>
  </body>
</html>
`;
}
