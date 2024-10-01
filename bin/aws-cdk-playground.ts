#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StateMachineStack } from '../lib/state-machine.stack';
import { createResourceName, getConfig } from '../lib/config';
import { DynamoDBStack } from '../lib/dynamodb.stack';
import { SaveEventStack } from '../lib/save-event.stack';
import { TriggerEventStack } from '../lib/trigger-event.stack';
import { LambdaFunctions } from '../lib/types';

// 1. Retrieving our config and envs
const config = getConfig();
const app = new cdk.App();

const dynamoDbStack = new DynamoDBStack(app, createResourceName('DynamoDb'));

const lambdaFunctions: LambdaFunctions = {
  saveEvent: new SaveEventStack(app, createResourceName('SaveEvent'), {
    table: dynamoDbStack.table,
  }).function,
  triggerEvent: new TriggerEventStack(app, createResourceName('TriggerEvent'), {
    table: dynamoDbStack.table,
  }).function,
};

new StateMachineStack(app, createResourceName('state-machine'), {
  env: {
    // 2. Passing our REGION env to our stack to control the region it's deployed to
    region: config.AWS_REGION,
  },
  // 3. Passing our entire config to our stack as a prop for us to use.
  config,
  table: dynamoDbStack.table,
  lambdaFunctions,
});
