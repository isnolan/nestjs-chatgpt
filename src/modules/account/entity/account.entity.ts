import { Entity, Column } from 'typeorm';
import { Base } from '../../common/entity/base.entity';

@Entity('chatgpt_account')
export class Account extends Base {
  @Column({ type: 'tinyint', comment: '供应商类型' })
  Provider: ProviderEnum;

  @Column({ type: 'varchar', length: 32, comment: '用户名', default: '' })
  User: string;

  @Column({ type: 'varchar', length: 32, comment: '密码', default: '' })
  Password: string;

  @Column({ type: 'varchar', length: 32, comment: 'API KEY', default: '' })
  ApiKey: string;
}

export enum ProviderEnum {
  CHATGPT = 1,
  OPENAI = 2,
}
