import * as aws from 'aws-sdk';

const dynamoDB = new aws.DynamoDB.DocumentClient();

export const handler = async (event: any) => {
  const id = event.detail.id; // Modify according to your event structure
  const item = { id, ...event.detail };

  await dynamoDB
    .put({
      TableName: process.env.TABLE_NAME as string,
      Item: item,
    })
    .promise();

  return { status: 'Event saved successfully' };
};
