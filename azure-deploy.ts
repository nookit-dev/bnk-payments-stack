import { spawn } from 'bun';
import pkg from './package.json';

// Utility function to run a command using Bun's spawn
const runCommand = async (
  command: string,
  args: string[],
  env: { [key: string]: string | undefined }
): Promise<void> => {
  const result = await spawn(command, args, { env: process.env, shell: true });
  const { exitCode, stdout, stderr } = result;

  if (stdout) {
    console.log(`stdout: ${stdout}`);
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }

  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}`);
  }
};

// Read the app name from package.json
const getAppName = (): string => {
  try {
    return pkg.name;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return 'bnk-server'; // Fallback name
  }
};

// Function to tag and push Docker image
const tagAndPushDockerImage = async (imageName: string, newTag: string) => {
  await runCommand('docker', ['tag', imageName, newTag], process.env);
  await runCommand('docker', ['push', newTag], process.env);
};

// Main function to run all commands
const runAllCommands = async () => {
  const appName = getAppName();
  const dockerHubUsername = Bun.env.DOCKER_HUB_USERNAME;
  const acrName = Bun.env.ACR_NAME;
  const resourceGroupName = Bun.env.RESOURCE_GROUP_NAME;

  try {
    // Docker build
    await runCommand('docker', ['build', '-t', appName, '.'], process.env);

    // Tag and push to Docker Hub
    const dockerHubTag = `${dockerHubUsername}/${appName}:latest`;
    await tagAndPushDockerImage(appName, dockerHubTag);

    // Azure login and Docker push to ACR
    await runCommand('az', ['acr', 'login', '--name', acrName], process.env);
    const acrTag = `${acrName}.azurecr.io/${appName}:latest`;
    await tagAndPushDockerImage(appName, acrTag);

    // Azure container creation
    await runCommand(
      'az',
      [
        'container',
        'create',
        '--resource-group',
        resourceGroupName,
        '--name',
        `${appName}-container`,
        '--image',
        dockerHubTag,
        '--dns-name-label',
        `${appName}-app`,
        '--ports',
        '8080',
      ],
      process.env
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Execute the script
runAllCommands();
