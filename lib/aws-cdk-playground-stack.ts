import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { createResourceName, ConfigProps } from './config';

// 1. New type for the props adding in our configuration
type AwsCdkPlaygroundStackProps = cdk.StackProps & {
  config: Readonly<ConfigProps>;
};

export class AwsCdkPlaygroundStack extends cdk.Stack {
  // 2. Consuming our type for `props` and making props mandatory
  constructor(scope: Construct, id: string, props: AwsCdkPlaygroundStackProps) {
    super(scope, id, props);

    // 3. Retrieving our config with our environment variables from the props
    const { config } = props;

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, createResourceName('MyTable'), {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Define Lambda functions for each task
    const lambdaFunctions = {
      saveEvent: new lambda.Function(
        this,
        createResourceName('SaveEventFunction'),
        {
          runtime: lambda.Runtime.NODEJS_20_X,
          code: lambda.Code.fromAsset('./src/save-event'),
          handler: 'saveEvent.handler',
          environment: { TABLE_NAME: table.tableName },
        }
      ),
      triggerEvent: new lambda.Function(
        this,
        createResourceName('TriggerEventFunction'),
        {
          runtime: lambda.Runtime.NODEJS_20_X,
          code: lambda.Code.fromAsset('./src/trigger-event'),
          handler: 'triggerEvent.handler',
          environment: { TABLE_NAME: table.tableName },
        }
      ),
    };

    // Grant the Lambda functions necessary permissions on DynamoDB
    table.grantWriteData(lambdaFunctions.saveEvent);
    table.grantReadData(lambdaFunctions.triggerEvent);

    // Ordered dictionary of tasks (task name -> corresponding lambda function)
    const orderedTasks: Record<string, lambda.Function> = {
      'Save Event': lambdaFunctions.saveEvent,
      'Trigger Event': lambdaFunctions.triggerEvent,
    };

    // Variable to hold the first task
    let firstTask: (sfn.IChainable & sfn.INextable) | undefined = undefined;

    // Variable to track the last chained task
    let lastTask: (sfn.IChainable & sfn.INextable) | undefined = undefined;

    // Iterate over the ordered tasks and chain them together
    Object.entries(orderedTasks).forEach(
      ([taskName, lambdaFunction], index) => {
        const task = new tasks.LambdaInvoke(this, taskName, {
          lambdaFunction,
          outputPath: '$.Payload',
        });

        // If this is the first task, set it as the firstTask
        if (index === 0) {
          firstTask = task;
        }

        // If there's a previous task, chain it to the current one
        if (lastTask) {
          lastTask.next(task);
        }

        // Update lastTask to be the current task
        lastTask = task;
      }
    );

    // Define the state machine starting from the first task in the chain
    if (firstTask) {
      const stateMachine = new sfn.StateMachine(
        this,
        createResourceName('StateMachine'),
        {
          definitionBody: sfn.DefinitionBody.fromChainable(firstTask),
        }
      );
    }
  }
}
