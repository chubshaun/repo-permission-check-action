const core = require("@actions/core");
const github = require("@actions/github");

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

// Permission levels higher in the array have higher access to the repo.
const perms = ["none", "read", "write", "admin", "superuser"];

const username = github.context.actor;
(async () => {
  const response = await octokit.rest.repos.getCollaboratorPermissionLevel({
    ...github.context.repo,
    username: username
  });

  let permission = response.data.permission; // Permission level of actual user
  let argPerm = core.getInput("permission"); // Permission level passed in through args

  let yourPermIdx = perms.indexOf(permission);
  let requiredPermIdx = perms.indexOf(argPerm);

  core.debug(`[Action] User Permission: ${permission}`);
  core.debug(`[Action] Minimum Action Permission: ${argPerm}`);

  core.info(`Actor: ${username}`);
  core.info(`User's Current Permission Level: ${permission}`);
  core.info(`Required Permission Level for Action: ${argPerm}`);

  // If the index of your permission is at least or greater than the required,
  // exit successfully. Otherwise fail.
  if (yourPermIdx >= requiredPermIdx) {
    core.info(`[Action] User has sufficient permissions.`);
    process.exit(0);
  } else {
    core.error(`[Action] User does not have sufficient permissions.`);
    process.exit(1);
  }
})();
