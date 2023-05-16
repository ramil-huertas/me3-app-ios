/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const nodelibs = require('node-libs-react-native');

nodelibs.crypto = `${__dirname}/src/libs/crypto.js`;
module.exports = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
        minifierPath: 'metro-minify-terser',
    },
    resolver: {
        extraNodeModules: nodelibs,
    },
};
