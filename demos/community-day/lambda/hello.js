const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({});

exports.handler = async function (event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  const params = {
    Message: JSON.stringify({
      message: "Processing event from EventBridge",
      eventDetail: event.detail,
    }),
    TopicArn: process.env.SNS_TOPIC_ARN,
  };

  try {
    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    console.log(`Message sent to the topic ${params.TopicArn}`);
    console.log("MessageID is " + data.MessageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Message published successfully",
        messageId: data.MessageId,
      }),
    };
  } catch (err) {
    console.error("Error publishing to SNS:", err);
    throw err;
  }
};
