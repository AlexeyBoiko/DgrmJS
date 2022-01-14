import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/index.js',
	output: {
		file: 'dist/index.min.js',
		format: 'iife',
		plugins: [terser({
			mangle: {
				keep_classnames: false,
				keep_fnames: false,
				properties: {
					regex: /^_/
				}
			}
		})]
	}
};
