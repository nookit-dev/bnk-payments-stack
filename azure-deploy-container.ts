import { spawnSync } from 'bun';
import pkg from './package.json';

const DEBUG = true;

// First setup an AKS registry to push images to
// Then create  a container apps environment
// Then based on the above set your AZURE_REGISTRY_NAME, AZURE_REGISTRY_USERNAME, AZURE_REGISTRY_PASSWORD, AZURE_RESOURCE_GROUP_NAME, AZURE_CONTAINER_ENV

type EnvTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  json: any;
};

function generateUniqueTag(): string {
  return new Date().toISOString().replace(/[:.-]/g, '');
}

const getAppName = (): string => pkg.name || 'bnk-server';
const acrName = envKey('AZURE_REGISTRY_NAME');
const appName = getAppName();
const uniqueTag = generateUniqueTag();
const acrTag = `${acrName}.azurecr.io/${appName}:${uniqueTag}`;
const resourceGroupName = envKey('AZURE_RESOURCE_GROUP_NAME');
const containerEnv = envKey('AZURE_CONTAINER_ENV');
const acrRegistryName = envKey('AZURE_REGISTRY_NAME');

function constructAcrImageUrl(
  subscriptionId: string,
  resourceGroupName: string,
  registryName: string,
  repositoryName: string,
  tag: string = uniqueTag
): string {
  const registryId = encodeURIComponent(
    `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ContainerRegistry/registries/${registryName}`
  );
  const encodedRepositoryName = encodeURIComponent(repositoryName);
  const encodedTag = encodeURIComponent(tag);
  return `https://portal.azure.com/#view/Microsoft_Azure_ContainerRegistries/ImageMetadataBlade/registryId/${registryId}/repositoryName/${encodedRepositoryName}/tag/${encodedTag}`;
}
function envKey<T extends keyof EnvTypeMap = 'string'>(
  key: string,
  expectedType: T = 'string' as T
): EnvTypeMap[T] {
  const value = Bun.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  switch (expectedType) {
    case 'number':
      return Number(value) as EnvTypeMap[T];
    case 'boolean':
      return (value === 'true') as EnvTypeMap[T];
    case 'json':
      return JSON.parse(value) as EnvTypeMap[T];
    default:
      return value as EnvTypeMap[T];
  }
}

const runCmd = (command: string, args: string[]): Promise<void> => {
  if (DEBUG) {
    console.log(`Running command: ${command} ${args.join(' ')}`);
  }
  const result = spawnSync([command, ...args], { env: Bun.env, shell: true });
  if (result.exitCode !== 0) {
    const errorObject = {
      command: `${command} ${args.join(' ')}`,
      stdout: result.stdout,
      stderr: result.stderr,
    };
    throw new Error(`Command failed: 
    Command: ${errorObject.command}

    Stdout: ${errorObject.stdout}


    Stderr: ${errorObject.stderr}
    `);
  }
};

const runDockerLogin = () => {
  const password = envKey('AZURE_REGISTRY_PASSWORD');
  const args = [
    'login',
    `${acrRegistryName}.azurecr.io`,
    '--username',
    envKey('AZURE_REGISTRY_USERNAME'),
    '--password',
    password,
  ];

  const result = spawnSync(['docker', ...args], {
    env: Bun.env,
    shell: true,
  });

  if (result.exitCode !== 0) {
    throw new Error(`Docker login failed: ${result.stderr}`);
  }

  if (DEBUG) {
    console.log('Docker login successful');
  }
};

const performDeployment = () => {
  runDockerLogin();

  runCmd('docker', ['build', '-t', acrTag, '.']);
  runCmd('docker', ['push', acrTag]);

  if (DEBUG) {
    console.log('Pushed image to ACR');
    const subscriptionId = envKey('AZURE_SUBSCRIPTION_ID');
    const acrImageUrl = constructAcrImageUrl(
      subscriptionId,
      resourceGroupName,
      acrRegistryName,
      appName,
      uniqueTag
    );
    console.log(`ACR Image URL: ${acrImageUrl}`);
  }

  runCmd('az', ['set', '--subscription', envKey('AZURE_SUBSCRIPTION_ID')]);

  // Azure Container Apps deployment
  runCmd('az', [
    'containerapp',
    'create',
    '--name',
    pkg.name,
    '--resource-group',
    resourceGroupName,
    '--image',
    acrTag,
    '--environment',
    containerEnv,
  ]);
};

const writeDeploymentDetails = () => {
  const filename = `deployment-details-${appName}.json`;
  const file = Bun.file(filename);
  const writer = file.writer();

  writer.write(
    JSON.stringify(
      {
        appName,
        acrName,
        acrTag,
        resourceGroupName,
        containerEnv,
        acrRegistryName,
        uniqueTag,
      },
      null,
      2
    )
  );

  writer.end();
};

try {
  if (DEBUG) writeDeploymentDetails();

  performDeployment();
} catch (error) {
  console.error('An error occurred:', error);
}
