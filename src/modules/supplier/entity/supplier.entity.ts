import { Entity, Column } from 'typeorm';
import { Base } from '../../common/entity/base.entity';

@Entity('chatgpt_supplier')
export class Supplier extends Base {
  @Column({ type: 'tinyint', comment: '供应商类型' })
  Type: SupplierEnum;

  @Column({ type: 'varchar', length: 32, comment: '用户名', default: '' })
  User: string;

  @Column({ type: 'varchar', length: 32, comment: '密码', default: '' })
  Password: string;

  @Column({ type: 'varchar', length: 64, comment: 'API KEY', default: '' })
  ApiKey: string;

  @Column({ type: 'text', comment: 'Authorisation', default: null })
  Authorisation: string;
}

export enum SupplierEnum {
  CHATGPT = 1,
  OPENAI = 2,
}
