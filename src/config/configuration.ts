// 导出配置
export default () => {
  return {
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
