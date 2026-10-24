const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
module.exports = { output: 'export', basePath: bp, images: { unoptimized: true }, trailingSlash: true };
