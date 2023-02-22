import { Job } from 'bull';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Process, Processor, OnQueueActive, OnGlobalQueueCompleted } from '@nestjs/bull';

import { MessageGateway } from './message.gateway';

const importDynamic = new Function('modulePath', 'return import(modulePath)');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
@Processor('message')
export class MessageProcessor {
  private readonly proxy: any;
  private readonly logger = new Logger('message');
  private api: any;

  constructor(
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly events: MessageGateway,
  ) {
    this.proxy = config.get('proxy');

    this.initGPT();
  }

  async initGPT() {
    const { ChatGPTAPIBrowser } = await importDynamic('@yhostc/chatgpt');
    this.api = new ChatGPTAPIBrowser({
      debug: false,
      minimize: false,
      // proxyServer: '192.168.2.6:7890',
    });
    // await this.api.initSession();
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  private emit(roomId, event: string, payload: any) {
    return this.events.server.to(roomId).emit(event, payload);
  }

  /**
   * ChatGPT Process
   */
  @Process('chatgpt')
  async transfer(job: Job<unknown>) {
    console.log(`->message.job:`, job.data);
    // Get Local Conversation and Message ID
    const { roomId, question, supplierReplyId, conversationId } = job.data as any;
    const messageId = uuidv4();

    // const that = this;
    return new Promise(async (resolve, reject) => {
      try {
        // console.log(JSON.parse(await this.redis.get(`supplier_${roomId}`)));
        // Get authorisation from cache
        const supplier = JSON.parse(await this.redis.get(`supplier_${roomId}`));
        // Auto cookie signin from SupplierId
        await this.api.initSession({
          email: supplier.User,
          password: supplier.Password,
          cookies: JSON.parse(supplier.Authorisation),
        });

        await sleep(5000);

        const result = await this.api.sendMessage(question, {
          supplierReplyId,
          conversationId,
          messageId,
          onProgress: (res) => {
            // Send the progress to room
            this.emit(roomId, 'events', res?.response);
            console.log('->progress:', res?.response);
            this.events.server.to(roomId).emit('reply', {
              questionId: messageId,
              reply: res.response,
              supplierReplyId: res?.messageId,
              supplierConversationId: res?.conversationId,
            });
          },
        });
        // console.log(`->result:`);
        // // Send the result to room
        this.events.server.to(roomId).emit('reply', {
          questionId: messageId,
          reply: result.response,
          supplierReplyId: result?.messageId,
          supplierConversationId: result?.conversationId,
        });

        resolve({});
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  }

  /**
   * ChatGPT Process
   */
  @Process('supplier')
  async supplier(job: Job<unknown>) {
    console.log(`->supplier.job:`, job.data);
    // Get Local Conversation and Message ID
    const { roomId, userId } = job.data as any;
    // const that = this;
    return new Promise(async (resolve, reject) => {
      try {
        const key = `supplier_${roomId}`;
        const isCached = await this.redis.get(key);
        if (!isCached) {
          const supplier = await fetch(`http://127.0.0.1:3000/conversation/supplier`, {
            mode: 'cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, userId }),
          }).then((res) => res.json());
          console.log(`->supplier`, supplier);

          // Cache to redis
          await this.redis.set(key, JSON.stringify(supplier), 'EX', 3600);
        }

        resolve({});
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  }

  /**
   * 任务完成
   * @param jobId
   * @param result
   */
  @OnGlobalQueueCompleted()
  async onGlobalCompleted(jobId: number, result: any) {
    // const job = await this.transQueue.getJob(jobId);
    console.log('Job completed:', jobId);
  }
}
