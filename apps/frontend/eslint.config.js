import js from '@eslint/js';
import globals from 'globals';
import tseslint, { parser } from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

// Import the plugin objects
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
    globalIgnores(['dist']),

    {
        files: ['**/*.{ts,tsx}'],

        extends: [
            js.configs.recommended,

            tseslint.configs.recommended,

            reactHooks.configs['recommended-latest'],

            reactRefresh.configs.vite,
        ],

        languageOptions: {
            ecmaVersion: 2020,

            globals: globals.browser,

            parserOptions: {
                project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'prettier/prettier': 'error',
            'no-undef': [0],
            '@typescript-eslint/consistent-type-definitions': [2, 'type'],
            '@typescript-eslint/consistent-type-imports': [
                2,
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                    disallowTypeAnnotations: true,
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-restricted-imports': [
                2,
                {
                    paths: [
                        {
                            name: 'react-redux',
                            importNames: ['useSelector', 'useStore', 'useDispatch'],
                            message:
                                'Please use pre-typed versions from `src/app/hooks.ts` instead.',
                        },
                    ],
                },
            ],
            //add max line rule
            'max-lines': [
                'error',
                {
                    max: 500,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },

    // 3. Prettier: Always put the flat config version last to disable all formatting rules.
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
]);
