const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/uvesh/Documents/Storage");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now());
  },
});

// const upload = multer({ storage: storage });

function createMulterMiddleware(fieldNames) {
  return multer({ storage: storage }).fields(fieldNames);
}

module.exports = createMulterMiddleware;

// const uploadMiddleware = (req, res, next) => {

//     if (req.files) {
//         upload.fields()
//         // Single file upload
//         upload.single('image')(req, res, err => {

//             if (err) {
//                 console.log("Error uploading file:", err);
//                 return res.status(500).send("Error uploading file.");
//             }
//             next(); // Move to the next middleware or route handler
//         });
//     } else if (req.files && req.files.length > 0) {
//         // Multiple file upload
//         upload.array('images', 4)(req, res, err => {
//             if (err) {
//                 console.log("Error uploading files:", err);
//                 return res.status(500).send("Error uploading files.");
//             }
//             next(); // Move to the next middleware or route handler
//         });
//     }
// };

// module.exports = upload;
