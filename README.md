seba:ufs-s3
=========================

NOTE: This package is under active development right now (2016-04-10). It has
bugs and the API may continue to change. Please help test it and fix bugs,
but don't use in production yet.

A Meteor package that adds AWS S3 support for UploadFS.

## Installation

Install using Meteor. When in a Meteor app directory, enter:

```
$ meteor add seba:ufs-s3
```

## Usage

Put the necessary information into your S3 store options, like so:

```js

const Photos = new Mongo.Collection('photos');

const photosStore = new UploadFS.store.S3({
    collection: Photos,
    name: 'photos',
    chunkSize: 1024 * 255,
    container: "myContainer", //required
  	storageAccountOrConnectionString: "account or connection string", // WABS storage account or connection string; required if not set in environment variables
  	storageAccessKey: "secret", //WABS storage access key; required if using a storage account and not set in environment variables
  	folder: "folder/in/bucket", //optional, which folder (key prefix) in the container to use
});
```
```

### Client, Server, and WABS credentials

There are two approaches to safely storing your S3 credentials:

1. As system environment variables (Amazon's [recommended approach].
2. As given in the above code but located in a directory named `server` (note: wrapping in `Meteor.isServer` is **NOT**
secure).

**For Step 2:**

You need to define your store in two files: one located in a `server` director and one located in a `client` directory. In the client-side-only file, simply don't define any options when creating your Store.