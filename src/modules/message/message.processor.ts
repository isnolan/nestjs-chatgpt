import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { InjectQueue, Process, Processor, OnQueueActive, OnGlobalQueueCompleted } from '@nestjs/bull';

import { MessageService } from './message.service';
import { Message } from './entity/message.entity';
import { SupplierService } from '../supplier/supplier.service';
import { Supplier } from '../supplier/entity/supplier.entity';

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
    private readonly supplier: SupplierService,
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
        // Auto cookie signin from SupplierId
        const { Authorisation } = await this.supplier.getOne(SupplierId);
        await this.api.initSession({ cookies: JSON.parse(Authorisation) });

        // Get Last Supplier Message Id
        const last = await this.service.getLastOne(ConversationId, MessageId);
        // console.log(`->last:`, last);

        // Get this time message
        const { QuestionId, Question } = await this.service.getOne(MessageId);
        //console.log(`->this:`, QuestionId, Question);
        console.log(`->query: `, last?.SupplierConversationId, last?.SupplierReplyId);
        const result = await this.api.sendMessage(Question, {
          conversationId: last?.SupplierConversationId,
          parentMessageId: last?.SupplierReplyId,
          messageId: QuestionId,
          onProgress: (res) => {
            console.log('->progress:', res?.response);
          },
        });
        console.log(`->result:`, result);

        // {
        //   response: 'Hello! How can I help you today?',
        //   conversationId: '3bd72683-4301-4cab-b700-3661cef44538',
        //   messageId: 'd569071d-b06c-41ec-aa59-b2dec54e6019'
        // }

        // save supplier reply
        if (result) {
          const model = plainToClass(Message, {
            Id: MessageId,
            ConversationId,
            Reply: result?.response,
            SupplierReplyId: result?.messageId,
            SupplierConversationId: result?.conversationId,
          });
          await this.service.save(model);
        }

        resolve(result);
      } catch (err) {
        console.warn(err);

        reject(err);
      } finally {
        // close the session and save the update cookies
        const cookies = await this.api.closeSession();
        const model = plainToClass(Supplier, {
          Id: SupplierId,
          Authorisation: JSON.stringify(cookies),
        });
        const res = await this.supplier.save(model);
        console.log(`->update authorisation`, res.UpdateTime);
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
