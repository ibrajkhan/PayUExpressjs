// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // app.use(
// //   cors({
// //     origin: "https://www.miceandmore.co.in",
// //     methods: ["POST"],
// //     credentials: true,
// //   })
// // );

// app.use(
//   cors({
//     origin: ["https://www.miceandmore.co.in", "https://miceandmore.co.in"],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;

// // Generate Hash
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

// // Validate Response Hash
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
//     "", // udf10 to udf6
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

//   if (expectedHash !== receivedHash) {
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }

//   res.redirect(
//     `https://miceandmore.co.in/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}&remainingNames=${udf4}&pax=${udf5}`
//   );
// });

// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// app.listen(5000, () => {
//   console.log("🚀 PayU Hash Server running at http://localhost:5000");
// });

// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// // For Node fetch; import at top level
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: ["https://www.miceandmore.co.in", "https://miceandmore.co.in"],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL = "https://sheetdb.io/api/v1/6n0icf7jmq5rr"; // Your SheetDB API URL

// // 1. Generate PayU Hash
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

// // 2. PayU Success Handler (validates hash, redirects with all info for success page)
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
//     "", // udf10, udf9, udf8, udf7, udf6
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

//   if (expectedHash !== receivedHash) {
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }

//   // Validate or parse delegates JSON (optional, for logging or debugging)
//   // You can parse and check here if you want, but frontend handles actual storing

//   // Encode udf4 (delegates JSON string) for redirect URL param
//   const delegatesParam = encodeURIComponent(udf4 || "[]");

//   res.redirect(
//     `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//       txnid
//     )}&amount=${encodeURIComponent(
//       amountFixed
//     )}&delegates=${delegatesParam}&organisation=${encodeURIComponent(
//       udf2
//     )}&designation=${encodeURIComponent(udf3)}&pax=${encodeURIComponent(udf5)}`
//   );
// });

// // 3. PayU Fail Handler
// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// // 4. Register endpoint to save data to SheetDB
// app.post("/register", async (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       organisation,
//       designation,
//       delegates, // expect array of {name, email, phone}
//       payment_status = "Success",
//       payment_mode = "PayU",
//       payment_date = new Date().toISOString(),
//     } = req.body;

//     if (!Array.isArray(delegates) || delegates.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Delegates data missing or invalid" });
//     }

//     // Prepare rows to insert (each delegate as a row with the shared data)
//     const data = delegates.map((d) => ({
//       txnid,
//       amount,
//       organisation,
//       designation,
//       delegate_name: d.name,
//       delegate_email: d.email,
//       delegate_phone: d.phone,
//       payment_status,
//       payment_mode,
//       payment_date,
//     }));

//     // Send POST to SheetDB
//     const sheetRes = await fetch(SHEETDB_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ data }),
//     });

//     const result = await sheetRes.json();
//     res.json({ success: true, sheetDbResponse: result });
//   } catch (error) {
//     console.error("Error saving to SheetDB:", error);
//     res
//       .status(500)
//       .json({ success: false, error: error.message || error.toString() });
//   }
// });

// app.listen(5000, () => {
//   console.log("🚀 PayU Hash Server running at http://localhost:5000");
// });

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

// For Node fetch; import at top level
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS - allow your frontend origins including localhost for dev
app.use(
  cors({
    origin: [
      "http://localhost:3000", // for local dev
      "https://www.miceandmore.co.in", // production frontend
      "https://miceandmore.co.in", // production alternate domain
    ],
    methods: ["POST"],
    credentials: true,
  })
);

const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL =
//   process.env.SHEETDB_URL || "https://sheetdb.io/api/v1/6n0icf7jmq5rr";
const SHEETDB_URL = "https://sheetdb.io/api/v1/6n0icf7jmq5rr";
// 1. Generate PayU Hash
app.post("/generate-hash", (req, res) => {
  try {
    let {
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

    // Trim all input to avoid stray spaces
    const txnidStr = (txnid || "").trim();
    const productinfoStr = (productinfo || "").trim();
    const firstnameStr = (firstname || "").trim();
    const emailStr = (email || "").trim();
    const udf1Str = (udf1 || "").trim();
    const udf2Str = (udf2 || "").trim();
    const udf3Str = (udf3 || "").trim();
    const udf4Str = (udf4 || "").trim();
    const udf5Str = (udf5 || "").trim();

    // Construct hash string exactly per PayU spec
    const hashString = [
      MERCHANT_KEY,
      txnidStr,
      amountFixed,
      productinfoStr,
      firstnameStr,
      emailStr,
      udf1Str,
      udf2Str,
      udf3Str,
      udf4Str,
      udf5Str,
      "",
      "",
      "",
      "",
      "", // udf6 - udf10 blank
      SALT,
    ].join("|");

    console.log("Hash String for PayU:", hashString); // Debugging, remove in prod

    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    res.json({ hash });
  } catch (error) {
    console.error("Error generating hash:", error);
    res.status(500).json({ error: "Hash generation failed" });
  }
});

// 2. PayU Success Handler - validate hash and redirect user
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

  // Hash sequence reversed per PayU's postback spec
  const hashSequence = [
    SALT,
    status,
    "",
    "",
    "",
    "",
    "", // udf10 through udf6 empty
    udf5.trim(),
    udf4.trim(),
    udf3.trim(),
    udf2.trim(),
    udf1.trim(),
    email.trim(),
    firstname.trim(),
    productinfo.trim(),
    amountFixed,
    txnid.trim(),
    key.trim(),
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
    console.error(
      "Hash mismatch: expected ",
      expectedHash,
      " but received ",
      receivedHash
    );
    return res.redirect("https://miceandmore.co.in/payment-fail");
  }

  // Redirect to success with all info as query params (encoding delegates json string in udf4)
  const delegatesParam = encodeURIComponent(udf4 || "[]");

  res.redirect(
    `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
      txnid
    )}&amount=${encodeURIComponent(
      amountFixed
    )}&delegates=${delegatesParam}&organisation=${encodeURIComponent(
      udf2
    )}&designation=${encodeURIComponent(udf3)}&pax=${encodeURIComponent(udf5)}`
  );
});

// 3. PayU Fail Handler - redirect to failure page
app.post("/payu/fail", (req, res) => {
  res.redirect("https://miceandmore.co.in/payment-fail");
});

// 4. Register endpoint - save delegates data to SheetDB
app.post("/register", async (req, res) => {
  try {
    const {
      txnid,
      amount,
      organisation,
      designation,
      delegates, // Array of delegate objects with name/email/phone
      payment_status = "Success",
      payment_mode = "PayU",
      payment_date = new Date().toISOString(),
    } = req.body;

    if (!Array.isArray(delegates) || delegates.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Delegates data missing or invalid" });
    }

    const dataRows = delegates.map((d) => ({
      txnid,
      amount,
      organisation,
      designation,
      delegate_name: d.name,
      delegate_email: d.email,
      delegate_phone: d.phone,
      payment_status,
      payment_mode,
      payment_date,
    }));

    // Send data to SheetDB
    const sheetRes = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataRows }),
    });

    const result = await sheetRes.json();

    res.json({ success: true, sheetDbResponse: result });
  } catch (error) {
    console.error("Error saving to SheetDB:", error);
    res
      .status(500)
      .json({ success: false, error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PayU Hash Server running at http://localhost:${PORT}`);
});
