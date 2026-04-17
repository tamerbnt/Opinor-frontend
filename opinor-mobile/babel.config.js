module.exports = function(api) {
  const isProd = api.env('production');
  const plugins = [
    'react-native-worklets/plugin',
  ];

  if (isProd) {
    plugins.push('transform-remove-console');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
