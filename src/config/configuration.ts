// 导出配置
export default () => {
  return {
    draft: process.env.DRAFT_SERVER,

    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },

    proxy: process.env.PROXY_AGENT,
  };
};
