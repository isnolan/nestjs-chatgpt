import { Entity, Column } from 'typeorm';
import { Base } from '../../common/entity/base.entity';

@Entity('chatgpt_account')
export class Account extends Base {
  @Column({ comment: 'Provider Type', default: '' })
  Provider: ProviderEnum;

  @Column({ type: 'varchar', length: 32, comment: 'UserName', default: '' })
  User: string;

  @Column({ type: 'varchar', length: 32, comment: 'Password', default: '' })
  Password: string;

  @Column({ type: 'varchar', length: 32, comment: 'API KEY', default: '' })
  ApiKey: string;

  @Column({ comment: '视频秒长', default: 0 })
  Duration: number;

  @Column({ type: 'tinyint', comment: '转码状态', default: 0 })
  TransState: number;
}

export enum ProviderEnum {
  CHATGPT = 'chatgpt',
  OPENAI = 'openai',
}
