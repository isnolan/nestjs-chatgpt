import { Entity, Column } from 'typeorm';
import { Base } from '../../common/entity/base.entity';

@Entity('chatgpt_conversation')
export class Conversation extends Base {
  @Column({ type: 'varchar', length: 64, comment: 'User Id' })
  UserId: string;

  @Column({ type: 'int', comment: 'SupplierId Id', default: 0 })
  SupplierId: number;

  @Column({ type: 'tinyint', comment: 'SupplierId Type', default: 0 })
  SupplierType: number;
}

export enum ProviderEnum {
  CHATGPT = 1,
  OPENAI = 2,
}
