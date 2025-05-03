require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const SALT = process.env.PAYU_SALT;

// Generate Hash
app.post("/generate-hash", (req, res) => {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = req.body;

  const amountFixed = parseFloat(amount).toFixed(2);
  const hashString = `${MERCHANT_KEY}|${txnid}|${amountFixed}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  res.json({ hash });
});

// Validate Response Hash
app.post("/payu/success", (req, res) => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    hash: receivedHash,
    additionalCharges,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = req.body;

  const amountFixed = parseFloat(amount).toFixed(2);

  const hashSequence = [
    SALT,
    status,
    "",
    "",
    "",
    "",
    "", // udf10 to udf6
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amountFixed,
    txnid,
    key,
  ];

  let hashString = hashSequence.join("|");
  if (additionalCharges) {
    hashString = `${additionalCharges}|${hashString}`;
  }

  const expectedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  if (expectedHash !== receivedHash) {
    return res.redirect("http://localhost:3000/payment-fail");
  }

  res.redirect(
    `http://localhost:3000/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}`
  );
});

app.listen(5000, () => {
  console.log("🚀 PayU Hash Server running at http://localhost:5000");
});

// corrected from me
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const MERCHANT_KEY = "XxdvtM";
// const SALT = "UklOkxIMWkGc06BPEjRIq9fs9QxTIqwD";

// // ✅ Route 1: Generate PayU Request Hash
// app.post("/generate-hash", (req, res) => {
//   const {
//     txnid,
//     amount,
//     productinfo,
//     firstname,
//     email,
//     udf1 = "",
//     udf2 = "",
//     udf3 = "",
//     udf4 = "",
//     udf5 = "",
//   } = req.body;

//   const amountFixed = parseFloat(amount).toFixed(2);
//   const hashString = `${MERCHANT_KEY}|${txnid}|${amountFixed}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;
//   const hash = crypto.createHash("sha512").update(hashString).digest("hex");

//   res.json({ hash });
// });

// // ✅ Route 2: Validate PayU Response Hash
// app.post("/payu/success", (req, res) => {
//   const {
//     key,
//     txnid,
//     amount,
//     productinfo,
//     firstname,
//     email,
//     status,
//     hash: receivedHash,
//     additionalCharges,
//     udf1 = "",
//     udf2 = "",
//     udf3 = "",
//     udf4 = "",
//     udf5 = "",
//   } = req.body;

//   const amountFixed = parseFloat(amount).toFixed(2);

//   const hashSequence = [
//     SALT,
//     status,
//     "",
//     "",
//     "",
//     "",
//     "", // udf10 to udf6 (empty)
//     udf5,
//     udf4,
//     udf3,
//     udf2,
//     udf1,
//     email,
//     firstname,
//     productinfo,
//     amountFixed,
//     txnid,
//     key,
//   ];

//   let hashString = hashSequence.join("|");
//   if (additionalCharges) {
//     hashString = `${additionalCharges}|${hashString}`;
//   }

//   const expectedHash = crypto
//     .createHash("sha512")
//     .update(hashString)
//     .digest("hex");

//   console.log("✅ Expected hash string:", hashString);
//   console.log("✅ Expected hash:", expectedHash);
//   console.log("✅ Received hash:", receivedHash);

//   if (expectedHash !== receivedHash) {
//     return res.redirect("http://localhost:3000/payment-fail");
//   }

//   res.redirect(
//     `http://localhost:3000/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}`
//   );
// });

// app.listen(5000, () => {
//   console.log("🚀 PayU Hash Server running at http://localhost:5000");
// });

// end corrected one from me

// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const MERCHANT_KEY = "XxdvtM";
// const SALT = "UklOkxIMWkGc06BPEjRIq9fs9QxTIqwD";

// // ✅ Route 1: Generate PayU Request Hash
// app.post("/generate-hash", (req, res) => {
//   const {
//     txnid,
//     amount,
//     productinfo,
//     firstname,
//     email,
//     udf1 = "",
//     udf2 = "",
//     udf3 = "",
//     udf4 = "",
//     udf5 = "",
//   } = req.body;

//   const amountFixed = parseFloat(amount).toFixed(2);

//   const hashString = `${MERCHANT_KEY}|${txnid}|${amountFixed}|${productinfo.trim()}|${firstname.trim()}|${email.trim()}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;
//   const hash = crypto.createHash("sha512").update(hashString).digest("hex");

//   res.json({ hash });
// });

// app.post("/payu/success", (req, res) => {
//   const {
//     key,
//     txnid,
//     amount,
//     productinfo,
//     firstname,
//     email,
//     status,
//     hash: receivedHash,
//     additionalCharges,
//     udf1,
//     udf2,
//     udf3,
//   } = req.body;

//   const amountFixed = parseFloat(amount).toFixed(2);

//   const baseString = `${SALT}|${status}|||||||||||${email.trim()}|${firstname.trim()}|${productinfo.trim()}|${amountFixed}|${txnid}|${key}`;
//   const hashString =
//     typeof additionalCharges !== "undefined" && additionalCharges
//       ? `${additionalCharges}|${baseString}`
//       : baseString;

//   const expectedHash = crypto
//     .createHash("sha512")
//     .update(hashString)
//     .digest("hex");

//   console.log("✅ Expected hash string:", hashString);
//   console.log("✅ Expected hash:", expectedHash);
//   console.log("✅ Received hash:", receivedHash);

//   if (expectedHash !== receivedHash) {
//     return res.redirect("http://localhost:3000/payment-fail");
//   }

//   res.redirect(
//     `http://localhost:3000/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}`
//   );
// });

// app.listen(5000, () => {
//   console.log("🚀 PayU Hash Server running at http://localhost:5000");
// });

// app.post("/payu/success", (req, res) => {
//   console.log("Incoming POST to /payu/success");
//   console.log("req.body:", req.body);

//   const {
//     key,
//     txnid,
//     amount,
//     productinfo,
//     firstname,
//     email,
//     status,
//     hash,
//     udf1,
//     udf2,
//     udf3,
//     udf4 = "",
//     udf5 = "",
//   } = req.body;

//   if (!txnid || !amount || !key || !hash) {
//     return res.status(400).send("❌ Missing fields in PayU POST");
//   }

//   const amountFixed = parseFloat(amount).toFixed(2);

//   // ✅ CORRECT HASH FOR RESPONSE:
//   const expectedHashString = `${SALT}|${status}|||||||||||${email.trim()}|${firstname.trim()}|${productinfo.trim()}|${amountFixed}|${txnid}|${key}`;

//   const expectedHash = crypto
//     .createHash("sha512")
//     .update(expectedHashString)
//     .digest("hex");

//   console.log({ email, firstname, productinfo, amountFixed, txnid, key });

//   console.log("Expected hash string:", expectedHashString);
//   console.log("Expected hash:", expectedHash);
//   console.log("Received hash:", hash);

//   if (expectedHash !== hash) {
//     return res.redirect("http://localhost:3000/payment-fail");
//   }

//   res.redirect(
//     `http://localhost:3000/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}`
//   );
// });
