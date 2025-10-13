const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.devServer = {
    ...config.devServer,
    https: {
      key: './key.pem',
      cert: './cert.pem',
      ca: './chain.pem',
    }
  };
  return config;
};
