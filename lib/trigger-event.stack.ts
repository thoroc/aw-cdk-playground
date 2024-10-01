import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { createResourceName } from './config';

type TriggerEventFunctionProps = cdk.StackProps & {
  table: dynamodb.Table;
};

export class TriggerEventStack extends cdk.Stack {
  public function: lambda.IFunction;

  constructor(scope: Construct, id: string, props: TriggerEventFunctionProps) {
    super(scope, id);

    const { table } = props;

    this.function = new lambda.Function(
      scope,
      createResourceName('TriggerEventFunction'),
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./src/trigger-event'),
        handler: 'triggerEvent.handler',
        environment: { TABLE_NAME: table.tableName },
      }
    );

    table.grantReadData(this.function);
  }
}
