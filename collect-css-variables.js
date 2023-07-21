// I don't know what the fuck is going on here.
// This code was generated before the machine uprising with chatgpt and should
// create an org document with a list of all the css variables used.
// If for some reason the list is wrong, or incomplete, feel free to email the
// creator directly

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
      } else if (file.endsWith('.scss')) {
        scssFiles.push(filePath);
      }
    }
  }

  traverseDirectory(rootDir);

  return scssFiles;
}

function collectCSSVariables(filePathArray) {
  const variableGroups = [];
  let tmpGroup = 'Undistributed Group';

  for (const filePath of filePathArray) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

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
  }

  return variableGroups;
}

function createOrgModeDocument(variableGroups) {
  let orgContent = `:PROPERTIES:
:ID: css-variables
:END:

#+TITLE: List of CSS Variables
#+ID: css-variables

`;

  variableGroups.forEach((group) => {
    orgContent += `* ${group.groupName}\n`;
    group.variables.forEach((variable) => {
      orgContent += `- ${variable}\n`;
    });
  });

  return orgContent;
}

const rootDir = './src/css';
const scssFiles = findSCSSFiles(rootDir);
const variableGroups = collectCSSVariables(scssFiles);

const orgDoc = createOrgModeDocument(variableGroups);
fs.writeFile('VARIABLES.org', orgDoc, 'utf8', (err) => {
  if (err) throw err;
  console.log('The Org mode document has been saved to VARIABLES.org.');
});
