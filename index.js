const actions = require('@actions/core');
const { google } = require('googleapis');
const fs = require('fs');
const archiver = require('archiver');
const { file } = require('googleapis/build/src/apis/file');

/** Google Service Account credentials  encoded in base64 */
const credentials = actions.getInput('credentials', { required: true });
/** Google Drive Folder ID to upload the file/folder to */
const folder = actions.getInput('folder', { required: false });
actions.info(`folder ${folder}`)
/** Local path to the file/folder to upload */
const target = actions.getInput('target', { required: true });
/** Link to the Drive folder */
const link = 'link';

const credentialsJSON = JSON.parse(Buffer.from(credentials, 'base64').toString());
actions.info(`credentialsJSON ${credentialsJSON.toString()}`)
             
const scopes = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.JWT(credentialsJSON.client_email, null, credentialsJSON.private_key, scopes);
const drive = google.drive({ version: 'v3', auth });

const driveLink = `https://drive.google.com/drive/folders/${folder}`
let filename = target.split('\\').pop();
actions.info(`filename ${filename}`);

async function main() {
  //actions.setOutput(link, driveLink);
  uploadToDrive();
}
/**
 * Uploads the file to Google Drive
 */
function uploadToDrive() {
  actions.info('Uploading file to Goole Drive...');
  
  let body;
  
  try {
   body = fs.createReadStream(`${target}`)
   actions.info(`body ${body.toString()}`)
  } 
  catch (e) {
    actions.error('Something wrong in creating body...');
    throw e;
  }
  
  drive.files.create({
    requestBody: {
      name: filename,
      parents: [folder]
    },
    media: {
      body
    },
    supportsAllDrives: true,
    supportsTeamDrives: true
  }).then(() => actions.info('File uploaded successfully...'))
    .catch(e => {
      actions.error('Upload failed!');
      throw e;
    });
}

main().catch(e => actions.setFailed(e));
