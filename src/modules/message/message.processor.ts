import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { InjectQueue, Process, Processor, OnQueueActive, OnGlobalQueueCompleted } from '@nestjs/bull';

import { MessageService } from './message.service';

const importDynamic = new Function('modulePath', 'return import(modulePath)');

@Processor('message')
export class MessageProcessor {
  private readonly proxy: any;
  private readonly chatgpt: any;
  private readonly logger = new Logger('message');
  private api: any;

  constructor(
    @InjectQueue('message')
    private readonly queue: Queue,
    private readonly config: ConfigService,
    private readonly service: MessageService,
  ) {
    this.proxy = config.get('proxy');
    this.chatgpt = config.get('chatgpt');

    this.initGPT();
  }

  async initGPT() {
    const { ChatGPTAPIBrowser } = await importDynamic('@yhostc/chatgpt');
    this.api = new ChatGPTAPIBrowser({
      ...this.chatgpt,
      debug: false,
      minimize: false,
      // proxyServer: '192.168.2.6:7890'
    });
    // await this.api.initSession();
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`);
  }

  /**
   * ChatGPT Process
   */
  @Process('chatgpt')
  async transfer(job: Job<unknown>) {
    console.log(`->message.job:`, job.data);

    // Get Local Conversation and Message ID
    const { SupplierId, ConversationId, MessageId } = job.data as any;
    return new Promise(async (resolve, reject) => {
      try {
        // const result = await this.api.sendMessage(Question, {
        //   conversationId: last?.SupplierConversationId,
        //   parentMessageId: last?.SupplierReplyId,
        //   messageId: QuestionId,
        //   onProgress: (res) => {
        //     console.log('->progress:', res?.response);
        //   },
        // });
        // console.log(`->result:`, result);
        // resolve(result);
      } catch (err) {
        console.warn(err);
        reject(err);
      } finally {
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
