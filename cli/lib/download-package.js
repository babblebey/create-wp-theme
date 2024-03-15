// import { cleanEnv } from "envalid";
import { downloadTemplate } from "giget";
// import { isNotEmptyStr } from "../utils/env-validators.js";

// const env = cleanEnv(process.env ,{
//   REPO_FULLNAME: isNotEmptyStr()
// });

/**
 * Download Package from the cwpt repository's `package` directory 
 * @param {string} packageSubdir 
 * @param {string} targetDir 
 * @returns {Promise<{dir: string, source: string}>}
 */
export default async function downloadCWPTPackage(packageSubdir, targetDir) {
  const { dir, source } = await downloadTemplate(`github:babblebey/create-wp-theme/packages/${packageSubdir}#develop`, {
    dir: targetDir,
    repo: "babblebey/create-wp-theme",
    force: true,
    cwd: "."
  });

  return { dir, source };
}