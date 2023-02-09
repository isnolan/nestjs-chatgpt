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

    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },

    chatgpt: {
      email: process.env.CHATGPT_EMAIL,
      password: process.env.CHATGPT_PASSWORD,
      nopechaKey: process.env.CHATGPT_NOPECHA,
    },

    proxy: {
      agent: process.env.PROXY_AGENT,
      path: process.env.PROXY_PATH,
    },
  };
};
