const path = require("path");
const fs = require("fs");
const { readdir } = require("fs").promises;

const appSettings = require("../../../config/appsettings.json");

const beforeBuild = async (pathsToLocales, pathToFile) => {
  async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);

      if (dirent.isDirectory()) {
        yield* getFiles(res);
      } else {
        yield { path: res, fileName: dirent.name };
      }
    }
  }

  const getLocalesFiles = async () => {
    const files = [];

    for await (const p of pathsToLocales) {
      for await (const f of getFiles(p)) {
        if (f) files.push(f);
      }
    }

    return files;
  };

  const localesFiles = await getLocalesFiles();

  const cultures = appSettings.web.cultures;

  localesFiles.forEach((file) => {
    const splitPath = file.path.split("\\");

    const length = splitPath.length;

    const url = [
      splitPath[length - 3],
      splitPath[length - 2],
      splitPath[length - 1],
    ].join("/");

    const fileName = splitPath[length - 1].split(".")[0];

    let lng = splitPath[length - 2];

    let language = lng == "en-US" || lng == "en-GB" ? "en" : lng;

    if (cultures.indexOf(language) === -1) {
      return;
    }

    const splitted = lng.split("-");

    if (splitted.length == 2 && splitted[0] == splitted[1].toLowerCase()) {
      language = splitted[0];
    }

    language = language.replace("-", "");

    const alias =
      fileName.indexOf("Common") === -1 ? "ASSETS_DIR" : "PUBLIC_DIR";

    const importString = `import ${fileName}${language}Url from "${alias}/${url}?url"`;

    const defineString = `["${fileName}", ${fileName}${language}Url]`;
  });
};

module.exports = beforeBuild;
