
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import sass from 'rollup-plugin-sass';
import {terser} from "rollup-plugin-terser";
import {version} from './package.json';

const appName = 'Dateline';
const year = new Date().getFullYear();

const banner = `
/*!
 * ${appName} ${version}
 * (c) ${year} Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */
`;

const footer = `
function dateline(id,options) {return new Dateline.Widget(id,options);}
`;

const outro = `exports.version = '${version}';`;

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/dateline.js',
        format: 'iife',
        name: appName,
        // sourcemap: true,
        banner: banner,
        outro: outro,
        footer: footer
    },
    plugins: [
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        commonjs(),
        json(),

        sass({
            output: true,
            // insert: true,
            options: {
                outputStyle: 'compressed'
            }
        }),

        buble({
             transforms: {
                 modules: false,
                 dangerousForOf: true,
                 dangerousTaggedTemplateString: true
             }
        }),

        terser({
            output: {
                 comments: /^!/
            }
        })
    ]
};
