if (Meteor.isServer) {
    const AWS = Npm.require('aws-sdk');
}

const validS3ServiceParamKeys = [
    'endpoint',
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'credentials',
    'credentialProvider',
    'region',
    'maxRetries',
    'maxRedirects',
    'sslEnabled',
    'paramValidation',
    'computeChecksums',
    's3ForcePathStyle',
    'httpOptions',
    'apiVersion',
    'apiVersions',
    'logger',
    'signatureVersion'
];
const validS3PutParamKeys = [
    'ACL',
    'Body',
    'Bucket',
    'CacheControl',
    'ContentDisposition',
    'ContentEncoding',
    'ContentLanguage',
    'ContentLength',
    'ContentMD5',
    'ContentType',
    'Expires',
    'GrantFullControl',
    'GrantRead',
    'GrantReadACP',
    'GrantWriteACP',
    'Key',
    'Metadata',
    'ServerSideEncryption',
    'StorageClass',
    'WebsiteRedirectLocation'
];

/**
 * GridFS store
 * @param options
 * @constructor
 */
UploadFS.store.S3 = function (options) {
    // Set default options
    options = Object.assign({
        chunkSize: 1024 * 255,
        collectionName: 'uploadfs'
    }, options);

    // Check options
    if (!Match.test(options.chunkSize, Number)) {
        throw new TypeError('chunkSize is not a number');
    }

    if (!Match.test(options.collectionName, String)) {
        throw new TypeError('collectionName is not a string');
    }



    // Create the store
    var store = new UploadFS.Store(options);

    if (Meteor.isServer) {
        // Determine which folder (key prefix) in the bucket to use
        var folder = options.folder;
        if (typeof folder === "string" && folder.length) {
            if (folder.slice(0, 1) === "/") {
                folder = folder.slice(1);
            }
            if (folder.slice(-1) !== "/") {
                folder += "/";
            }
        } else {
            folder = "";
        }

        const bucket = options.bucket;

        if (!bucket){
            throw new Error('UploadFS.store.S3 you must specify the "bucket" option');
        }

        const defaultAcl = options.ACL || 'private';

        // Remove serviceParams from SA options
        // options = _.omit(options, validS3ServiceParamKeys);

        const serviceParams = Object.assign({
            Bucket: bucket,
            region: null, //required
            accessKeyId: null, //required
            secretAccessKey: null, //required
            ACL: defaultAcl
        }, options);

        // Whitelist serviceParams, else aws-sdk throws an error
        // XXX: I've commented this at the moment... It stopped things from working
        // we have to check up on this
        // serviceParams = _.pick(serviceParams, validS3ServiceParamKeys);

        // Create S3 service
        const s3Api = new AWS.S3(serviceParams);

        /**
         * Removes the file
         * @param fileId
         * @param callback
         */
        store.delete = function (fileId, callback) {
            if (typeof callback !== 'function') {
                callback = function (err) {
                    err && console.error(`ufs: cannot delete file "${ fileId }" at ${ path } (${ err.message })`);
                }
            }
            s3Api.deleteObject({
                Bucket: bucket,
                Key: folder + fileId
            }, error => {callback(error, !error);});
        };

        /**
         * Returns the file read stream
         * @param fileId
         * @return {*}
         */
        store.getReadStream = function (fileId) {
            return s3Api.createReadStream({
                Bucket: bucket,
                Key: folder + fileId
            });
        };

        /**
         * Returns the file write stream
         * @param fileId
         * @return {*}
         */
        store.getWriteStream = function (fileId, file) {
            //if (options.contentType) {
            //    options.ContentType = options.contentType;
            //}
            //
            //// We dont support array of aliases,contentType,Metadata?
            //options = _.omit(options,'aliases','contentType','metadata');

            // Set options
            var options = Object.assign({
                Bucket: bucket,
                Key: folder + fileId,
                fileKey: fileKey,
                ACL: defaultAcl
            }, options || {});

            return s3Api.createWriteStream(options);
        };
    }

    return store;
};
