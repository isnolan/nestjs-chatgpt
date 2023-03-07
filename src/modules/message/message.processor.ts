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

    const options: any = {
      email: supplier.User,
      password: supplier.Password,
    };
    // cookies
    if (supplier.Authorisation) {
      options.cookies = JSON.parse(supplier.Authorisation);
    }
    // proxy server
    if (this.proxy) {
      options.proxyServer = this.proxy;
    }
    // plus account
    if (supplier.IsPlus) {
      options.isProAccount = true;
    }

    this.api = new ChatGPTAPIBrowser(options);
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
      const warnings = `抱歉，内容涉及敏感词汇，小智无法作答！同时，请关注[草稿智能]关于敏感内容的内容通告和账号处理规定！`;
      try {
        // TODO:输入关键词检测
        let payload: any = {};
        const checking = await this.checkWords(question);
        if (checking.length > 0) {
          // 存在敏感词
          payload = {
            questionId: messageId,
            reply: warnings,
            supplierReplyId: '',
            supplierConversationId: '',
          };
          this.emit(conversationId, 'reply', payload);
        } else {
          // 不存在敏感词
          const result = await this.api.sendMessage(question, {
            parentMessageId: supplierReplyId,
            conversationId: supplierConversationId,
            messageId,
            onProgress: (res) => {
              // Send the progress to room
              console.log('->progress:', res?.response);
              // this.emit(conversationId, 'events', res?.response);
              this.emit(conversationId, 'progress', {
                questionId: messageId,
                reply: this.replaceWords(res.response),
                supplierReplyId: res?.messageId,
                supplierConversationId: res?.conversationId,
              });
            },
          });

          const reply = this.replaceWords(result.response);
          const checking = await this.checkWords(reply);
          payload = {
            conversationId,
            userId,
            questionId: messageId,
            question,
            reply,
            supplierReplyId: result?.messageId,
            supplierConversationId: result?.conversationId,
          };

          if (checking.length > 0) {
            payload.reply = warnings;
            payload.warnings = 1;
          }
          this.emit(conversationId, 'reply', payload);
          payload.reply = reply; // 封存内容
        }

        // TODO:输出关键词检测
        // console.log(`->result:`);
        // // Send the result to room

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

  /**
   * 敏感词检测
   * @param content
   * @returns
   */
  private async checkWords(content: string): Promise<any[]> {
    const url = this.endpoint.checking;
    const res: any = await fetch(url, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).then((res) => res.json());
    if (res.code != '0') {
      console.error(`[checkwords]`, res);
      return [];
    }
    return res.word_list;
  }

  private replaceWords(content: string): string {
    return content
      .replace(/^\s+|\s+$/g, '')
      .replace(/(chatgpt)/gi, '小智')
      .replace(/(openai)/gi, '草稿智能');
  }
}
