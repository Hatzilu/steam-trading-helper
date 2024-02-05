import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
	{
		input: 'src/index.js', // Entry point of your application
		output: {
			file: 'dist/content-script.js', // Output file
			format: 'cjs', // Output format (immediately-invoked function expression)
			sourcemap: false, // Generate sourcemaps for debugging
			compact: true,
		},
		plugins: [
			terser(),
			copy({
				targets: [
					{ src: 'src/manifest.json', dest: 'dist' },
					{ src: 'icons/*', dest: 'dist/icons/*' },
				],
			}),
		],
	},
	{
		input: 'src/background.js',
		output: {
			file: 'dist/background.js',
			format: 'cjs',
			sourcemap: false, // Generate sourcemaps for debugging
			compact: true,
		},
		plugins: [terser()],
	},
];

export default config;
