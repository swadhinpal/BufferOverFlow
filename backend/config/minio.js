const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password',
});

const bucketName = 'codestore';

// Create bucket if it doesn't exist
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) return console.error('Error checking MinIO bucket:', err);

  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) console.error('Error creating bucket:', err);
      else console.log(`Bucket "${bucketName}" created successfully`);
    });
  } else {
    console.log(`Bucket "${bucketName}" already exists`);
  }
});

module.exports = { minioClient, bucketName };
