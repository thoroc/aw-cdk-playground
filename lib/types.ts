import * as lambda from 'aws-cdk-lib/aws-lambda';

export type LambdaFunctions = { [key: string]: lambda.IFunction };
