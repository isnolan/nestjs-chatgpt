import {
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class Base {
  @PrimaryGeneratedColumn()
  @PrimaryColumn({ comment: 'ID' })
  Id: number;

  @Column({ comment: '商户/站点ID', default: 0, nullable: true })
  MerchantId: number;

  @Column({ type: 'tinyint', comment: '状态', default: 0, nullable: true })
  Status: number;

  @Column({ comment: '是否删除', default: false, nullable: true })
  IsDelete: boolean;

  @Column({ comment: '操作人ID', default: 0, nullable: true })
  OperatorId: number;

  @Column({ comment: '修改人ID', default: 0, nullable: true })
  UpdateUserId: number;

  //自动为实体插入日期
  @CreateDateColumn({ comment: '创建时间' })
  CreateTime: Date;

  //每次调用实体管理器或存储库的save时，自动更新实体日期
  @UpdateDateColumn({ comment: '更新时间' })
  UpdateTime: Date;

  //每次调用实体管理器或存储库的save时自动增长实体版本
  @VersionColumn({ type: 'tinyint', comment: '数据版本', default: 0 })
  Version: number;
}
