const {Storage} = require('@google-cloud/storage');

//bucket storage
//auth key
const projectId = 'ece461part2team4';

async function authenticateImplicitWithAdc() {
    // This snippet demonstrates how to list buckets.
    // NOTE: Replace the client created below with the client required for your application.
    // Note that the credentials are not specified when constructing the client.
    // The client library finds your credentials using ADC.
    const storage = new Storage({
      projectId,
    });
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
  
    for (const bucket of buckets) {
      console.log(`- ${bucket.name}`);
    }
  
    console.log('Listed all storage buckets.');
  }
  
  authenticateImplicitWithAdc();


//Upload
// The ID of your GCS bucket
 const bucketName = 'ece_461_part2_uploads';

// The contents that you want to upload
const contents = "test_package";

// The new ID for your GCS file
const destFileName = 'file1';
      
// Creates a client
const storage = new Storage();

async function uploadFromMemory() {
    await storage.bucket(bucketName).file(destFileName).save(contents);
     console.log(
        `${destFileName} with contents ${contents} uploaded to ${bucketName}.`
    );
}

uploadFromMemory().catch(console.error);

//Download
// Creates a client
// const storage = new Storage();

async function downloadIntoMemory() {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

  console.log(
    `Contents of gs://${bucketName}/${fileName} are ${contents.toString()}.`
  );
}

downloadIntoMemory().catch(console.error);
