import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';


export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parser: tseslint.parser,
        },
        files: ['*.ts'],
        plugins: {},
        rules: {},
    }
];
