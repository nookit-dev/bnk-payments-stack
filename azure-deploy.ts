import readline from 'readline';
import pkg from './package.json';

// Utility function to run a command using Bun's spawn
const runCommand = async (
  command: string,
  args: string[],
  options?: {
    //env: { [key: string]: string | undefined };
    cwd?: string;
  }
): Promise<void> => {
  // Merge the command and its arguments
  const commandArgs = [command, ...args];

  // Execute the command
  const result = await Bun.spawn(commandArgs, {
    ...options,
    env: Bun.env,
    shell: true,
  });

  // Destructure result to get exitCode, stdout, stderr
  const { exitCode, stdout, stderr } = result;

  if (stdout) {
    console.log(`stdout: ${stdout}`);
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }

  console.log({ exitCode });

  // if (exitCode !== 0) {
  //     throw new Error(`Command failed with exit code ${exitCode}`);
  // }
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
  await runCommand('docker', ['tag', imageName, newTag]);
  await runCommand('docker', ['push', newTag]);
};

const tagAndPushDockerImageToACR = async (
  imageName: string,
  acrName: string,
  acrPassword: string
) => {
  // Docker login to ACR
  await runCommand('docker', ['login', acrName + '.azurecr.io', '-u', acrName, '-p', acrPassword]);

  // Tag and push to ACR
  const acrTag = `${acrName}.azurecr.io/${imageName}:latest`;
  await runCommand('docker', ['tag', imageName, acrTag]);
  await runCommand('docker', ['push', acrTag]);
};

const promptInput = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

// Main function to run all commands
const runAllCommands = async () => {
  const appName = getAppName();
  const acrName = Bun.env.AZURE_ACR_NAME || '';
  const acrPassword = Bun.env.AZURE_ACR_PASSWORD || '';
  const resourceGroupName = Bun.env.AZURE_RESOURCE_GROUP_NAME || '';

  if (!acrName) {
    console.error('ACR name not found in environment variables');
    return;
  }

  if (!acrPassword) {
    console.error('ACR password not found in environment variables');
    return;
  }

  if (!resourceGroupName) {
    console.error('Resource group name not found in environment variables');
    return;
  }

  try {
    // Docker build
    await runCommand('docker', ['build', '-t', appName, '.']);

    await runCommand('az', ['login']);

    await promptInput('Press any key to continue...');

    // Azure login and Docker push to ACR
    await tagAndPushDockerImageToACR(appName, acrName, acrPassword);

    // Azure container creation
    await runCommand('az', [
      'container',
      'create',
      '--resource-group',
      resourceGroupName,
      '--name',
      `${appName}-container`,
      '--image',
      `${acrName}.azurecr.io/${appName}:latest`, // Reference to ACR image
      '--dns-name-label',
      appName,
      '--ports',
      '3000',
      '--registry-username',
      acrName,
      '--registry-password',
      acrPassword,
    ]);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Execute the script
runAllCommands();
