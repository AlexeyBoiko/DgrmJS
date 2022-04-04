import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/diagram/svg-presenter/svg-diagram-factory.js',
	output: {
		file: 'dist/diagram-npm-package/index.js',
		format: 'es',
		plugins: [
			terser({
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
