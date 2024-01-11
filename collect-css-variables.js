// I don't know what the fuck is going on here.
// This code was generated before the machine uprising with chatgpt and should
// create an org document with a list of all the css variables used.
// If for some reason the list is wrong, or incomplete, feel free to email the
// creator directly

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

function findSCSSFiles(rootDir) {
  const scssFiles = [];

  function traverseDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        traverseDirectory(filePath);
      } else if (file.endsWith('.scss') || file.endsWith('.vue')) {
        scssFiles.push(filePath);
      }
    }
  }

  traverseDirectory(rootDir);

  return scssFiles;
}

function collectCSSVariables(filePathArray) {
  const fileVariables = [];

  for (const filePath of filePathArray) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const variableGroups = [];
    const fileName = path.basename(filePath);
    let tmpGroup = 'Common';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('//')) {
        // Check if it's a comment
        tmpGroup = line.substring(2).trim(); // Save comment as temporary group name
      } else if (line.startsWith('--')) {
        // Check if it's a CSS variable
        // Find existing group with the same name or create a new one
        const existingGroupIndex = variableGroups.findIndex(
          (group) => group.groupName === tmpGroup
        );

        if (existingGroupIndex > -1) {
          variableGroups[existingGroupIndex].variables.push(line);
        } else {
          variableGroups.push({
            groupName: tmpGroup,
            variables: [line],
          });
        }
      }
    }

    fileVariables.push({ fileName, variableGroups });
  }

  return fileVariables;
}

function createOrgModeDocument(fileVariableGroups) {
  let orgContent = `:PROPERTIES:
:ID: css-variables
:END:

#+TITLE: List of CSS Variables
#+ID: css-variables

`;

  fileVariableGroups.forEach((fv) => {
    if (!fv.variableGroups?.length) {
      return;
    }
    orgContent += `* ${fv.fileName}\n`;
    fv.variableGroups.forEach((vg) => {
      orgContent += `** ${vg.groupName}\n`;
      vg.variables.forEach((line) => {
        const [name, value] = line.split(':');
        orgContent += `- =${name}=: ${value}\n`;
      });
    });
  });

  return orgContent;
}

function generateTypes(groups) {
  const cssVariables = new Set();
  const themeVariables = new Set();

  groups.forEach((group) => {
    group.variableGroups.forEach((g) => {
      g.variables.forEach((variable) => {
        const [name] = variable.split(':');
        const target =
          g.groupName.toLowerCase() === 'colors'
            ? themeVariables
            : cssVariables;
        target.add(toCamelCase(name.slice(2)));
      });
    });
  });

  const themeVariableEnumBody = Array.from(themeVariables).reduce(
    (acc, variable) => {
      return `${acc}\n\t${variable} = '${variable}',`;
    },
    ''
  );

  const cssVariableEnumBody = Array.from(cssVariables).reduce(
    (acc, variable) => {
      return `${acc}\n\t${variable} = '${variable}',`;
    },
    ''
  );

  return (
    `export enum ThemeVariable {${themeVariableEnumBody}\n}` +
    `\n\nexport enum CSSVariable {${cssVariableEnumBody}\n}`
  );
}

function toCamelCase(s) {
  return s.replace(/-./g, (x) => x[1].toUpperCase());
}

program
  .name('Scss generator')
  .description('CLI tool for generating types and docs from css variables')
  .option('--docs')
  .option('--types');

program.parse(process.argv);

const options = program.opts();

const rootDir = './src';
const scssFiles = findSCSSFiles(rootDir);
const variableGroups = collectCSSVariables(scssFiles);

if (options.docs) {
  const orgDoc = createOrgModeDocument(variableGroups);
  fs.writeFile('VARIABLES.org', orgDoc, 'utf8', (err) => {
    if (err) throw err;
    console.log('The Org mode document has been saved to VARIABLES.org.');
  });
}

if (options.types) {
  const types = generateTypes(variableGroups);
  console.log(types);
}
