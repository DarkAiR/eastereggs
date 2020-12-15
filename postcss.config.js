module.exports = ({ file, options, env }) => ({
    parser: false,
    plugins: {
        "autoprefixer": {},
        'postcss-import': {},
        'postcss-cssnext': {},
        'cssnano':  env === 'production'  ? {} : false
    }
});
