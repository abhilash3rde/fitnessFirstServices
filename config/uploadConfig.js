// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
//
// cloudinary.config({
//   cloud_name: 'primefitness',
//   api_key: '572783897338239',
//   api_secret: 'qz3WFwYxgkjWfPjp5Y7nf9heejI'
// });
//
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads');
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     var filetype = '';
//     if (file.mimetype === 'image/gif') {
//       filetype = 'gif';
//     }
//     if (file.mimetype === 'image/png') {
//       filetype = 'png';
//     }
//     if (file.mimetype === 'image/jpeg') {
//       filetype = 'jpg';
//     }
//     cb(null, 'image-' + Date.now() + '.' + filetype);
//   }
// });
// const saveFileToServer = multer({storage: storage});
//
// module.exports = {
//   saveFileToServer
// }