import { Entity, Column } from 'typeorm';
import { Base } from '../../common/entity/base.entity';

@Entity('chatgpt_message')
export class Message extends Base {
  @Column({ comment: 'Conversation Id' })
  ConversationId: number;

  @Column({ type: 'varchar', length: 36, comment: 'Supplier Message Id' })
  QuestionId: string;

  @Column({ type: 'text', comment: 'message from user' })
  Question: string;

  @Column({ type: 'text', comment: 'message from supplier', default: null })
  Reply: string;

  @Column({ type: 'varchar', length: 36, comment: 'Supplier Reply Id', default: '' })
  SupplierReplyId: string;

  @Column({ type: 'varchar', length: 36, comment: 'Supplier Conversation Id', default: '' })
  SupplierConversationId: string;
}
