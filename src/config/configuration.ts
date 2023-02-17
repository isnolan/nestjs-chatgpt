// 导出配置
export default () => {
  return {
    draft: process.env.DRAFT_SERVER,

    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },

    proxy: {
      agent: process.env.PROXY_AGENT,
      path: process.env.PROXY_PATH,
    },

    chatgpt: {
      email: process.env.CHATGPT_EMAIL,
      password: process.env.CHATGPT_PASSWORD,
      nopechaKey: process.env.CHATGPT_NOPECHA,
    },
  };
};
