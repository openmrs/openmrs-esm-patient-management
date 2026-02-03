const config = require('openmrs/default-rspack-config');

module.exports = (env, argv) => {
    const defaultConfig = config(env, argv);

    const tsCheckerPlugin = defaultConfig.plugins.find((plugin) => plugin.constructor.name === 'TsCheckerRspackPlugin');

    if (tsCheckerPlugin) {
        tsCheckerPlugin.options.memoryLimit = 4096;
    }

    return defaultConfig;
};
