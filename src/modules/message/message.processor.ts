import * as fs from 'fs';
import Redis from 'ioredis';
import { Job, Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Process, Processor, OnQueueActive, OnGlobalQueueCompleted } from '@nestjs/bull';

import { MessageGateway } from './message.gateway';

const importDynamic = new Function('modulePath', 'return import(modulePath)');
// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
@Processor('message')
export class MessageProcessor {
  private readonly endpoint: any;
  private readonly proxy: any;
  private readonly logger = new Logger('message');
  private api: any;

  constructor(
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    @InjectQueue('message')
    private readonly messageQueue: Queue,
    private readonly events: MessageGateway,
  ) {
    this.endpoint = config.get('endpoint');
    this.proxy = config.get('proxy');

    this.initGPT();
  }

  /**
   * 初始化 ChatGPT 节点
   */
  async initGPT() {
    const { ChatGPTAPIBrowser } = await importDynamic('@yhostc/chatgpt');

    // 获取账号配置
    const supplier = await fetch(`${this.endpoint.draft}/supplier/distribute`, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: '1234567890', Id: this.endpoint.epid }),
    }).then((res) => res.json());
    console.log(`[supplier]`, supplier);
    this.api = new ChatGPTAPIBrowser({
      email: supplier.User,
      password: supplier.Password,
      cookies: JSON.parse(supplier.Authorisation),
      debug: false,
      minimize: false,
      proxyServer: this.proxy,
    });
    const cookies = await this.api.initSession();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies));
    console.log(`->init chatgpt`);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  private emit(conversationId, event: string, payload: any) {
    return this.events.server.to(conversationId).emit(event, payload);
  }

  /**
   * ChatGPT Process
   */
  @Process('chatgpt')
  async transfer(job: Job<unknown>) {
    console.log(`->message.job:`, job.data);
    // Get Local Conversation and Message ID
    const { conversationId, userId, question, supplierReplyId, supplierConversationId } = job.data as any;
    const messageId = uuidv4();
    // console.log(`[chatgpt]`, )
    // const that = this;
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.api.sendMessage(question, {
          parentMessageId: supplierReplyId,
          conversationId: supplierConversationId,
          messageId,
          onProgress: (res) => {
            // Send the progress to room
            this.emit(conversationId, 'events', res?.response);
            console.log('->progress:', res?.response);
            this.events.server.to(conversationId).emit('reply', {
              questionId: messageId,
              reply: res.response.replace(/^\s+|\s+$/g, ''),
              supplierReplyId: res?.messageId,
              supplierConversationId: res?.conversationId,
            });
          },
        });
        // console.log(`->result:`);
        // // Send the result to room
        const payload = {
          conversationId,
          userId,
          questionId: messageId,
          question,
          reply: result.response.replace(/^\s+|\s+$/g, ''),
          supplierReplyId: result?.messageId,
          supplierConversationId: result?.conversationId,
        };
        this.events.server.to(conversationId).emit('reply', payload);
        // ready to keep archives
        await this.messageQueue.add('archives', payload, {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: true,
        });
        resolve({});
      } catch (err) {
        console.warn(err);
        reject(err);
      }
    });
  }

  /**
   * KeepArchives
   * keep archives to business server
   */
  @Process('archives')
  async archives(job: Job<unknown>) {
    console.log(`->archives.job:`, job.data);
    return new Promise(async (resolve, reject) => {
      try {
        const { status } = await fetch(`${this.endpoint.draft}/message/archives`, {
          mode: 'cors',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job.data),
        });
        console.log(`[archives]`, status);

        if (status === 200) {
          resolve({});
          return;
        }
        reject(status);
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
