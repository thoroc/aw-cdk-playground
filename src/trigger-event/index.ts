import * as aws from 'aws-sdk';

const dynamoDB = new aws.DynamoDB.DocumentClient();
const eventBridge = new aws.EventBridge();

export const handler = async (event: any) => {
  const id = event.id; // Get the id of the saved event

  const result = await dynamoDB
    .get({
      TableName: process.env.TABLE_NAME as string,
      Key: { id },
    })
    .promise();

  // Logic to trigger an event based on the DynamoDB read
  const detail = result.Item; // Modify as necessary

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: 'my.source',
          DetailType: 'my.response',
          Detail: JSON.stringify(detail),
        },
      ],
    })
    .promise();

  return { status: 'Event triggered successfully' };
};
