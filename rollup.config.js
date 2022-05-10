import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/keccak.js',
        format: 'esm',
        interop: false,
        sourcemap: true,
    },
    plugins: [
        typescript()
    ]
};