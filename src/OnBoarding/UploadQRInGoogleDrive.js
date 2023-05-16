import { retrieveKeyValueData } from '@constants/Storage';
import { GDrive } from '@robinbobin/react-native-google-drive-api-wrapper';
import storageConst from '@constants/ConstStorage';
import wxqrcode from '../Tabbar/QRCode/wxqrcode';
import { logger } from '@constants/Log';

const gdrive = new GDrive();
gdrive.fetchTimeout = 3000;

export async function uploadImage(file) {
    let accessToken = await retrieveKeyValueData(storageConst.ACCESS_TOKEN);
    gdrive.accessToken = accessToken;
    return new Promise(function (resolve, reject) {
        const fileObject = {
            uid: 'uid',
            password: 'pwd',
            salt: 'salt',
            key: 'data',
        };

        let qrcodeBase64 = wxqrcode.createQrCodeImg(
            JSON.stringify(fileObject),
            {
                typeNumber: 20,
            },
        );
        try {
            if (qrcodeBase64) {
                const fileName = 'ME3_QR_TEST';
                let QR_b64 = qrcodeBase64.split(',')[1];
                gdrive.files
                    .newMultipartUploader()
                    .setData(`${QR_b64}`, 'image/gif')
                    .setRequestBody({
                        name: fileName,
                    })
                    .setIsBase64(true)
                    .execute()
                    .then(data => {
                        logger('Data :: ', data);
                    })
                    .catch(error => {
                        logger('error e :: ', error);
                    });
            }
        } catch (error) {
            logger('error e ', error);
        }
    });
}
/**
 * 
 * install node-blob by running npm i node-blob for using Blob in the function given below
 * var Blob = require('node-blob');

 * const dataURItoBlob = dataURI => {
 *   var base64Arr = dataURI.split(',');
 *   var imgtype = '';
 *   var base64String = '';
 *   if (base64Arr.length > 1) {
 *     base64String = base64Arr[1];
 *     imgtype = base64Arr[0].substring(
 *       base64Arr[0].indexOf(':') + 1,
 *       base64Arr[0].indexOf(';'),
 *     );
 *   }
 *   var bytes = Base64.atob(base64String);
 *   var bytesCode = new ArrayBuffer(bytes.length);
 *   var byteArray = new Uint8Array(bytesCode);
 *   for (var i = 0; i < bytes.length; i++) {
 *     byteArray[i] = bytes.charCodeAt(i);
 *   }
 *   return new Blob([bytesCode], {type: imgtype});
 * };
 */

/*****
 * 
 * 
 *  // gdrive.files.newMediaUploader().setData(JSON.stringify(form),'image/png').setRequestBody({
      //   name:fileName,
      // }).execute().then(response=>{
      //   console.log('gdrive response',response);
      // }).catch(error=>{
      //   console.log('gdrive error ',error);
      // })

      // fetch(
      //   `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`,
      //   {
      //     method: 'POST',
      //     headers: new Headers({
      //       "Authorization": 'Bearer '+accessToken,
      //       'Content-Type':'image/gif'
      //     }),
      //     body: form
      //   },
      // )
      //   .then(res => {
      //     console.log(`res.json :: `, res);
      //     res.json();
      //   }).catch(error=>{
      //       console.log('API response qr code upload error', error);
      //   }).then(() => {
      //       console.log(`QR_ID:: uploaded`);
      //   }).catch(error => {
      //       console.log('qr code upload error', error);
      //   });

      // var config1 = {
      //   method: 'post',
      //   url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      //   headers: {
      //     'Authorization': 'Bearer ' + accessToken,
      //     'Content-Type': 'image/gif',
      //   },
      //   data: JSON.stringify(form),
      // };

      // axios(config1)
      //   .then(async (response)=> {
      //     console.log('response.data :: response.data :: ',await response.data);
      //     resolve(response.data)
      //   })
      //   .catch((error)=> {
      //     console.log('response.error :: response.error :: ', error);
      //     reject(error)
      //   });
 * 
 * 
 * // const form = new FormData();
        // form.append(
        //   'metadata',
        //   new Blob([JSON.stringify({name: fileName})], {type: MimeTypes.JSON}),
        // );
        // let file = dataURItoBlob(qrcodeBase64);
        // form.append('file', file);
        // console.log('form ', form);

        // var config1 = {
        //   method: 'post',
        //   url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        //   headers: {
        //     'Authorization': 'Bearer ' + accessToken,
        //     'Content-Type': 'image/png',
        //   },
        //   data: JSON.stringify(form),
        // };

        // axios(config1)
        //   .then(async (response)=> {
        //     console.log('response.data :: response.data :: ',await response.data);
        //     resolve(response.data)
        //   })
        //   .catch((error)=> {
        //     console.log('response.error :: response.error :: ', error);
        //     reject(error)
        //   });

        // gdrive.files
        //   .newMultipartUploader()
        //   .setData(imagepath, 'image/png')
        //   .setRequestBody({
        //     name: fileName,
        //   })
        //   .execute()
        //   .then(data => {
        //     console.log('Data :: ', data);
        //   })
        //   .catch(error => {
        //     console.log('error e :: ', error);
        //   });
 * 
 * 
 * 
 * 
 * *****/

/***
 *
 * fs.readFile("file:///storage/emulated/0/DCIM/Camera/IMG_20190325_111404.jpg",'base64')
 * .then((res => {             //conversion of image to base64
 *     console.log(res);
 *     GDrive.files.createFileMultipart(
 *          res,
 *          "'image/jpg'", {
 *          parents: ["root"], //or any path
 *          name: "photo.jpg"
 *        },
 *          true) // here true is a flag for base64 string (is it a base64 ?)
 *           .then(a=>{
 *          console.log(a);
 *        });
 *      }
 *      );
 */

/** working example of uploading image by choosing it from device storage **/
/*
 * launchImageLibrary({mediaType:'photo',includeBase64:true,quality:1},response => {
 *   console.log(response.assets[0].base64);
 *   console.log(response.assets[0].uri);
 *   const b64 = response.assets[0].base64
 *    gdrive.files
 *   .newMultipartUploader()
 *   .setData(b64, 'image/jpeg')
 *   .setRequestBody({
 *     name: fileName,
 *   }).setIsBase64(true)
 *   .execute()
 *   .then(data => {
 *     console.log('Data :: ', data);
 *   })
 *   .catch(error => {
 *     console.log('error e :: ', error);
 *   });
 * })
 */
