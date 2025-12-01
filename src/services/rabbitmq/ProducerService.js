const amqp = require("amqplib");
const ProducerService = {
  sendMessage: async (queue, message) => {
    // connection
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    // channel
    const channel = await connection.createChannel();

    // queue
    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
