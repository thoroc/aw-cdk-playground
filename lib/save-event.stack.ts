import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { createResourceName } from './config';

type SaveEventFunctionProps = cdk.StackProps & {
  table: dynamodb.ITableV2;
};

export class SaveEventStack extends cdk.Stack {
  public function: lambda.IFunction;

  constructor(scope: Construct, id: string, props: SaveEventFunctionProps) {
    super(scope, id);

    const { table } = props;

    this.function = new lambda.Function(
      scope,
      createResourceName('SaveEventFunction'),
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./src/save-event'),
        handler: 'saveEvent.handler',
        environment: { TABLE_NAME: table.tableName },
      }
    );
  }
}
