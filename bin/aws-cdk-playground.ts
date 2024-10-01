#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkPlaygroundStack } from '../lib/aws-cdk-playground-stack';
import { createResourceName, getConfig } from '../lib/config';

// 1. Retrieving our config and envs
const config = getConfig();
const app = new cdk.App();
new AwsCdkPlaygroundStack(app, createResourceName('aws-cdk-playground-stack'), {
  env: {
    // 2. Passing our REGION env to our stack to control the region it's deployed to
    region: config.AWS_REGION,
  },
  config,
  // 3. Passing our entire config to our stack as a prop for us to use.
});
