// @ts-check

import fs from "fs";
import path from "path";
import color from "picocolors";
import minimist from "minimist";
import { intro, cancel, spinner, note } from "@clack/prompts";
import { fileExists } from "./utils/file-exist.js";
import resolveCommand from "./lib/resolve-command.js";
import resolveThemeName from "./lib/resolve-theme-name.js";
import resolveCSSFramework from "./lib/resolve-css-framework.js";
import injectThemeName from "./lib/inject-theme-name.js";
import injectCSSFramework from "./lib/inject-css-framework.js";
import downloadCWPTPackage from "./lib/download-package.js";
import resolvePackageManager from "./lib/resolve-package-manager.js";

async function run() {
  const cwd = process.cwd();
  
  // start
  intro(color.inverse("wp-theme"));

  // get arguments
  const argv = minimist(process.argv.slice(2));

  // get command and theme name from argv
  const commandFromArgv = argv._[0];
  const themeNameFromArgv = argv._[1];

  const command = await resolveCommand(commandFromArgv);
  const themeName = await resolveThemeName(themeNameFromArgv);

  if (command === "new") {
    // instantiate spinner
    const s = spinner();
  
    // compute location to save file to
    const filePath = path.join(cwd, themeName);
  
    // check if location already exist
    if (fileExists(filePath)) {
      console.log();
      cancel(color.red(`${filePath} already exists.`));
      process.exit(1);
    }
  
    // get specified css framework - only if supported
    const cssFramework = await resolveCSSFramework(argv);
  
    s.start("Copying theme files");
  
    // download cssFramework related package
    const templateToCopy = `templates/cwpt-${cssFramework}`;
    await downloadCWPTPackage(templateToCopy, themeName);
  
    // download node_script package
    await downloadCWPTPackage("node_scripts", `${themeName}/node_scripts`);
  
    // download base `theme` package
    await downloadCWPTPackage("theme", `${themeName}/theme`);
  
    s.stop("Files copied");
  
    s.start("Setting things up");
  
    // modify placeholders in package.json `bundle` script
    const packageJsonFile = path.resolve(filePath, "package.json");
    const packageJsonContent = fs.readFileSync(packageJsonFile, "utf-8");
    injectThemeName(packageJsonFile, packageJsonContent, themeName);
  
    // modify placeholders in `theme/style.css`
    const styleCssFile = path.resolve(filePath, "theme/style.css");
    const styleCssContent = fs.readFileSync(styleCssFile, "utf-8");
    injectThemeName(styleCssFile, styleCssContent, themeName);
    injectCSSFramework(styleCssFile, styleCssContent, cssFramework);
  
    /**
     * @todo consider modifying namespaces `cwpt` in `function.php` to theme name
     */
  
    s.stop("You're all set!");
  
    // detect package manager and its command prefix
    const { packageManager, commandPrefix } = resolvePackageManager();
  
    note(
      `${color.cyan(`cd ${path.relative(cwd, filePath)}`)}\n${color.cyan(`${packageManager} install`)}\n${color.cyan(`${commandPrefix} watch`)}`, 
      "Now run"
    );
  }
}

run().catch(console.error);