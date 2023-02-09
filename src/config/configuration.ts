// 导出配置
export default () => {
  return {
    database: {
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      timezone: 'Z',
      synchronize: process.env.NODE_ENV == 'development', // only dev
    },
  };
};
