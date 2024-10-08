import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Configure dotenv to read from our `.env.local` file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// 2. Define a TS Type to type the returned envs from our function below.
export type ConfigProps = {
  AWS_ACCOUNT: string;
  AWS_REGION: string;
  ORGANIZATION_ID: string;
  ENVIRONMENT: string;
};

// 3. Define a function to retrieve our env variables
export const getConfig = (): ConfigProps => ({
  AWS_ACCOUNT: process.env.AWS_ACCOUNT || '',
  AWS_REGION: process.env.AWS_REGION || 'eu-west-1',
  ORGANIZATION_ID: process.env.ORGANIZATION_ID || 'imbc',
  ENVIRONMENT: process.env.ENVIRONMENT || 'dv',
});

export const createResourceName = (name: string): string => {
  const config = getConfig();
  const prefix = config.ORGANIZATION_ID;
  const suffix = `${config.AWS_REGION}-${config.ENVIRONMENT}`;

  return `${prefix}-${toKebabCase(name)}-${suffix}`;
};

export const toPascalCase = (str: string): string => {
  return str
    .split('-')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};

export const toKebabCase = (str: string): string | undefined => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-');
};
