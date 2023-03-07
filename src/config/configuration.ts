// 导出配置
export default () => {
  return {
    endpoint: {
      epid: process.env.DRAFT_EPID,
      draft: process.env.DRAFT_SERVER,
      checking: process.env.DRAFT_CHECKING,
    },

    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
    },

    proxy: process.env.PROXY_AGENT,
  };
};
