Package.describe({
    name: 'seba:ufs-s3',
    version: '0.1.0',
    author: 'seba.kerckhof@gmail.com',
    summary: 'AWS S3 storage store for UploadFS',
    git: 'https://github.com/sebakerckhof/ufs-s3',
    documentation: 'README.md',
    license: 'MIT'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.1');
    api.use('check');
    api.use('underscore');
    api.use('ecmascript');
    api.use('mongo');
    api.use('jalik:ufs@0.5.3');
    api.addFiles([
        's3-patch.js',
        'ufs-s3.js'
        ]);
});

Npm.depends({
    'aws-sdk': "2.0.23",
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('seba:ufs-s3.js');
    api.addFiles('ufs-s3-tests.js');
});