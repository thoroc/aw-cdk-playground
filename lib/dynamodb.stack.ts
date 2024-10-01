import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { createResourceName } from './config';

export class DynamoDBStack extends cdk.Stack {
  public table: dynamodb.ITableV2;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, createResourceName('Events'), {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
  }
}
