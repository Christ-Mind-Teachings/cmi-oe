
const oldKey = require("./keyold");
const newKey = require("../../../../../common/modules/_config/key");

/*
 * Reads project.json found in ../public/config.
 *
 * Outputs project specific info to src/js/modules/_config/si.js. This
 * is imported by key.js and used to generate a key for each page. Keys
 * are used in search and bookmarks.
 *
 * Run this whenever pages are added or removed from configuration files.
 *
 * $ npm run updateConfiguration
 */
const fs = require('fs');

const args = process.argv.slice(2);
const outputFile = "src/js/modules/_config/keyComp.js";

let inPath = "public/config";

//This file specifies which config files to read
let project = `${inPath}/project.json`;

/*
 * Read configuration json files
 */
function readFile(fn) {
  try {
    let config = fs.readFileSync(fn, 'utf8');
    return JSON.parse(config);
  }
  catch(e) {
    console.error("Can't read file: %s", fn);
    process.exit(1);
  }
}

/*
 * divide url into array
 */
function splitUrl(url) {
  let u = url;

  //remove leading "/"
  u = url.substr(1);

  //remove trailing '/' if it exists
  if (u[u.length-1] === "/") {
    u = u.substr(0, u.length - 1);
  }

  return u.split("/");
}

/*
 * Extract url's from config file
 */
function buildArray(cfg, array, level2 = false) {
  for (let i=0; i < cfg.contents.length; i++) {
    if (cfg.contents[i].url) {
      if (!level2) {
        array.push(cfg.contents[i].url);
      }
      else {
        let part1 = array.pop();
        array.push(`${part1}/${cfg.contents[i].url}/`);
      }
    }
    if (cfg.contents[i].contents) {
      buildArray(cfg.contents[i], array, true);
    }
  }
}

//start program

let contents = [];
let projectInfo = readFile(project);

//read json files
for (let i=0; i < projectInfo.books.length; i++) {
  contents[i] = readFile(`${inPath}/${projectInfo.books[i]}.json`);
}

const output = fs.createWriteStream(`${outputFile}`);
/*
output.write("module.exports = {\n");

output.write(`  sourceId: ${projectInfo.sourceId},\n`);
output.write(`  sid: "${projectInfo.sid}",\n`);
output.write(`  prefix: "/t/${projectInfo.sid}",\n`);
output.write(`  books: ${JSON.stringify(projectInfo.books)},\n`);

let bookIds = ["xxx", ...projectInfo.books];

output.write(`  bookIds: ${JSON.stringify(bookIds)},\n`);

output.write("\n  contents: {\n");
*/
for (let i=0; i < contents.length; i++) {
  let array = [];
  buildArray(contents[i], array);
  console.log("%o", array);
  //output.write(`    ${contents[i].bid}: ${JSON.stringify(array)},\n`);
}
/*
output.write("  }\n");
output.write("};\n");
*/
output.end();

console.log("Done!");


