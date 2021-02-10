import babel from '@babel/core';
import fs from 'fs';
import path from 'path';

const pluginBabel = (options = {}) => ({
	name: 'babel',
	setup(build, { transform } = {}) {
		const { filter = /.*/, namespace = '', config = {} } = options;

		const transformContents = ({ args, contents }) => {
			const babelOptions = babel.loadOptions(config);

			if (babelOptions.sourceMaps) {
				const filename = path.relative(process.cwd(), args.path);

				babelOptions.sourceFileName = filename;
			}

			return new Promise((resolve, reject) => {
				babel.transform(contents, babelOptions, (error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve({ contents: result.code });
					}
				});
			});
		};

		if (transform) {
			return transformContents(transform);
		} else {
			build.onLoad({ filter, namespace }, async args => {
				const contents = await fs.promises.readFile(args.path, 'utf8');

				return transformContents({ args, contents });
			});
		}
	}
});

export default pluginBabel;
