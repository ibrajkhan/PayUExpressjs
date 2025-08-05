// Remaining Names
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: "https://www.miceandmore.co.in",
//     methods: ["POST"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: ["https://www.miceandmore.co.in", "https://miceandmore.co.in"],
    methods: ["POST"],
    credentials: true,
  })
);

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
    return res.redirect("https://miceandmore.co.in/payment-fail");
  }

  res.redirect(
    `https://miceandmore.co.in/payment-success?txnid=${txnid}&amount=${amountFixed}&name=${firstname}&email=${email}&phone=${udf1}&organisation=${udf2}&designation=${udf3}&remainingNames=${udf4}&pax=${udf5}`
  );
});

app.post("/payu/fail", (req, res) => {
  res.redirect("https://miceandmore.co.in/payment-fail");
});

app.listen(5000, () => {
  console.log("🚀 PayU Hash Server running at http://localhost:5000");
});

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

// first Change

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

// // Configure CORS - allow your frontend origins including localhost for dev
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000", // for local dev
//       "https://www.miceandmore.co.in", // production frontend
//       "https://miceandmore.co.in", // production alternate domain
//     ],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// // const SHEETDB_URL =
// //   process.env.SHEETDB_URL || "https://sheetdb.io/api/v1/6n0icf7jmq5rr";
// const SHEETDB_URL = "https://sheetdb.io/api/v1/6n0icf7jmq5rr";
// // 1. Generate PayU Hash
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;

//     const amountFixed = parseFloat(amount).toFixed(2);
//     const hashString = [
//       (MERCHANT_KEY || "").trim(),
//       (txnid || "").trim(),
//       amountFixed,
//       (productinfo || "").trim(),
//       (firstname || "").trim(),
//       (email || "").trim(),
//       (udf1 || "").trim(),
//       (udf2 || "").trim(),
//       (udf3 || "").trim(),
//       (udf4 || "").trim(),
//       (udf5 || "").trim(),
//       "",
//       "",
//       "",
//       "",
//       "", // udf6 to udf10
//       (SALT || "").trim(),
//     ].join("|");

//     // TEMPORARY DEBUG: Log the hash string you are sending!
//     console.log("PayU HASH STRING:", hashString);

//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");
//     res.json({ hash });
//   } catch (e) {
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// // 2. PayU Success Handler - validate hash and redirect user
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

//   // Hash sequence reversed per PayU's postback spec
//   const hashSequence = [
//     SALT,
//     status,
//     "",
//     "",
//     "",
//     "",
//     "", // udf10 through udf6 empty
//     udf5.trim(),
//     udf4.trim(),
//     udf3.trim(),
//     udf2.trim(),
//     udf1.trim(),
//     email.trim(),
//     firstname.trim(),
//     productinfo.trim(),
//     amountFixed,
//     txnid.trim(),
//     key.trim(),
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
//     console.error(
//       "Hash mismatch: expected ",
//       expectedHash,
//       " but received ",
//       receivedHash
//     );
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }

//   // Redirect to success with all info as query params (encoding delegates json string in udf4)
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

// // 3. PayU Fail Handler - redirect to failure page
// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// // 4. Register endpoint - save delegates data to SheetDB
// app.post("/register", async (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       organisation,
//       designation,
//       delegates, // Array of delegate objects with name/email/phone
//       payment_status = "Success",
//       payment_mode = "PayU",
//       payment_date = new Date().toISOString(),
//     } = req.body;

//     if (!Array.isArray(delegates) || delegates.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Delegates data missing or invalid" });
//     }

//     const dataRows = delegates.map((d) => ({
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

//     // Send data to SheetDB
//     const sheetRes = await fetch(SHEETDB_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ data: dataRows }),
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

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 PayU Hash Server running at http://localhost:${PORT}`);
// });

// Organizatin and designation
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// // Node fetch import for backend HTTP requests
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // CORS middleware - adjust origins for development/production as needed
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000", // dev frontend origin
//       "https://www.miceandmore.co.in", // production frontend
//       "https://miceandmore.co.in", // alternate production domain
//     ],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL =
//   process.env.SHEETDB_URL || "https://sheetdb.io/api/v1/6n0icf7jmq5rr";

// // 1. Generate PayU Hash
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;

//     // Always format amount to have 2 decimals
//     const amountFixed = parseFloat(amount).toFixed(2);

//     // PayU requires 10 udf fields total: udf1-udf10; blank ones included
//     // Separate fields by | in this exact order:
//     // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
//     const hashString = [
//       (MERCHANT_KEY || "").trim(),
//       (txnid || "").trim(),
//       amountFixed,
//       (productinfo || "").trim(),
//       (firstname || "").trim(),
//       (email || "").trim(),
//       (udf1 || "").trim(),
//       (udf2 || "").trim(),
//       (udf3 || "").trim(),
//       (udf4 || "").trim(),
//       (udf5 || "").trim(),
//       "",
//       "",
//       "",
//       "",
//       "", // udf6 through udf10 are empty
//       (SALT || "").trim(),
//     ].join("|");

//     // Debug: log for verification (remove after confirming correct)
//     console.log("PayU HASH STRING:", hashString);

//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");
//     res.json({ hash });
//   } catch (error) {
//     console.error("Error generating hash:", error);
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// // 2. PayU Success Handler - validate hash and redirect on success
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

//   // Construct hash string reverse order with udf6-udf10 empties per PayU doc
//   const reverseHashFields = [
//     (SALT || "").trim(),
//     (status || "").trim(),
//     "",
//     "",
//     "",
//     "",
//     "", // udf10 through udf6 blanks
//     (udf5 || "").trim(),
//     (udf4 || "").trim(),
//     (udf3 || "").trim(),
//     (udf2 || "").trim(),
//     (udf1 || "").trim(),
//     (email || "").trim(),
//     (firstname || "").trim(),
//     (productinfo || "").trim(),
//     amountFixed,
//     (txnid || "").trim(),
//     (key || "").trim(),
//   ];

//   let hashString = reverseHashFields.join("|");
//   if (additionalCharges) {
//     hashString = `${additionalCharges}|${hashString}`;
//   }

//   const expectedHash = crypto
//     .createHash("sha512")
//     .update(hashString)
//     .digest("hex");

//   if (expectedHash !== receivedHash) {
//     console.error("Hash mismatch", { expectedHash, receivedHash });
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }

//   // Encode delegates JSON string in udf4 for redirect querystring param
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

// // 4. Register endpoint to save delegate data to SheetDB
// app.post("/register", async (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       organisation,
//       designation,
//       delegates, // Array<{name, email, phone}>
//       payment_status = "Success",
//       payment_mode = "PayU",
//       payment_date = new Date().toISOString(),
//     } = req.body;

//     if (!Array.isArray(delegates) || delegates.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Delegates data missing or invalid" });
//     }

//     const rows = delegates.map((d) => ({
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

//     const sheetRes = await fetch(SHEETDB_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ data: rows }),
//     });

//     const sheetDbResult = await sheetRes.json();

//     res.json({ success: true, sheetDbResponse: sheetDbResult });
//   } catch (error) {
//     console.error("Error saving to SheetDB:", error);
//     res
//       .status(500)
//       .json({ success: false, error: error.message || error.toString() });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 PayU Hash Server running at http://localhost:${PORT}`);
// });

// Frontend Redirect
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");

// // For backend HTTP requests (SheetDB, node-fetch v3, dynamic import)
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://www.miceandmore.co.in",
//       "https://miceandmore.co.in",
//     ],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL = "https://sheetdb.io/api/v1/6n0icf7jmq5rr"; // You can move this to .env if you prefer.

// // --- 1. Generate PayU Hash (for payment initiation) ---
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;

//     const amountFixed = parseFloat(amount).toFixed(2);

//     // PayU official: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
//     const hashString = [
//       (MERCHANT_KEY || "").trim(),
//       (txnid || "").trim(),
//       amountFixed,
//       (productinfo || "").trim(),
//       (firstname || "").trim(),
//       (email || "").trim(),
//       (udf1 || "").trim(),
//       (udf2 || "").trim(),
//       (udf3 || "").trim(),
//       (udf4 || "").trim(),
//       (udf5 || "").trim(),
//       "",
//       "",
//       "",
//       "",
//       "", // udf6 to udf10 (empty as per PayU)
//       (SALT || "").trim(),
//     ].join("|");

//     // Debug logging for professional troubleshooting (remove after launch)
//     console.log("PayU HASH INPUTS:", {
//       MERCHANT_KEY,
//       txnid,
//       amount: amountFixed,
//       productinfo,
//       firstname,
//       email,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//     });
//     console.log("PayU HASH STRING:", hashString);
//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");
//     console.log("Hash:", hash);

//     res.json({ hash });
//   } catch (error) {
//     console.error("Error generating hash:", error);
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// // --- 2. PayU Success Handler (reverse hash for payment response validation) ---
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

//   // PayU reverse hash: salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
//   const reverseHashFields = [
//     (SALT || "").trim(),
//     (status || "").trim(),
//     "",
//     "",
//     "",
//     "",
//     "", // udf10 to udf6 (empty if unused)
//     (udf5 || "").trim(),
//     (udf4 || "").trim(),
//     (udf3 || "").trim(),
//     (udf2 || "").trim(),
//     (udf1 || "").trim(),
//     (email || "").trim(),
//     (firstname || "").trim(),
//     (productinfo || "").trim(),
//     amountFixed,
//     (txnid || "").trim(),
//     (key || "").trim(),
//   ];
//   let hashString = reverseHashFields.join("|");
//   if (additionalCharges) {
//     hashString = `${additionalCharges}|${hashString}`;
//   }
//   // Debug log (remove for production)
//   console.log("PayU Success HASH STRING:", hashString);

//   const expectedHash = crypto
//     .createHash("sha512")
//     .update(hashString)
//     .digezst("hex");
//   if (expectedHash !== receivedHash) {
//     console.error("Hash mismatch", { expectedHash, receivedHash });
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }

//   // Redirect back to frontend with all relevant info
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

// // --- 3. PayU Fail Handler ---
// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// // --- 4. Register endpoint to save data to SheetDB (per delegate row) ---
// app.post("/register", async (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       delegates,
//       payment_status = "Success",
//       payment_mode = "PayU",
//       payment_date = new Date().toISOString(),
//     } = req.body;

//     if (!Array.isArray(delegates) || delegates.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Delegates data missing or invalid" });
//     }

//     const rows = delegates.map((d) => ({
//       txnid,
//       amount,
//       organisation: d.organisation,
//       designation: d.designation,
//       delegate_name: d.name,
//       delegate_email: d.email,
//       delegate_phone: d.phone,
//       payment_status,
//       payment_mode,
//       payment_date,
//     }));

//     const sheetRes = await fetch(SHEETDB_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ data: rows }),
//     });

//     const sheetDbResult = await sheetRes.json();
//     res.json({ success: true, sheetDbResponse: sheetDbResult });
//   } catch (error) {
//     console.error("Error saving to SheetDB:", error);
//     res
//       .status(500)
//       .json({ success: false, error: error.message || error.toString() });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 PayU Hash Server running at http://localhost:${PORT}`);
// });

// Bakend redirect sucessful payment logic but email and data not saved
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const emailjs = require("@emailjs/nodejs");

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000", // Frontend dev URL
//       "https://www.miceandmore.co.in", // Production frontend
//       "https://miceandmore.co.in",
//     ],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// // === ENV CONFIG ===
// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL = process.env.SHEETDB_URL;
// const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
// const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
// const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

// if (
//   !MERCHANT_KEY ||
//   !SALT ||
//   !SHEETDB_URL ||
//   !EMAILJS_SERVICE_ID ||
//   !EMAILJS_TEMPLATE_ID ||
//   !EMAILJS_PUBLIC_KEY
// ) {
//   console.error(
//     "ERROR: One or more required environment variables are missing! Please check .env"
//   );
//   process.exit(1);
// }

// emailjs.init(EMAILJS_PUBLIC_KEY);

// // --- Generate PayU payment request hash ---
// function generatePayuRequestHash(params) {
//   const udfFields = [
//     params.udf1 || "",
//     params.udf2 || "",
//     params.udf3 || "",
//     params.udf4 || "",
//     params.udf5 || "",
//     params.udf6 || "",
//     params.udf7 || "",
//     params.udf8 || "",
//     params.udf9 || "",
//     params.udf10 || "",
//   ];
//   const hashString = [
//     params.key.trim(),
//     params.txnid.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.productinfo.trim(),
//     params.firstname.trim(),
//     params.email.trim(),
//     ...udfFields,
//   ].join("|");
//   const finalString = `${hashString}|${params.salt.trim()}`;
//   return crypto.createHash("sha512").update(finalString).digest("hex");
// }

// // --- Generate PayU response hash for verification ---
// function generatePayuResponseHash(params) {
//   const udfFields = [
//     params.udf10 || "",
//     params.udf9 || "",
//     params.udf8 || "",
//     params.udf7 || "",
//     params.udf6 || "",
//     params.udf5 || "",
//     params.udf4 || "",
//     params.udf3 || "",
//     params.udf2 || "",
//     params.udf1 || "",
//   ];
//   const baseParts = [
//     params.salt.trim(),
//     params.status.trim(),
//     ...udfFields,
//     params.email.trim(),
//     params.firstname.trim(),
//     params.productinfo.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.txnid.trim(),
//     params.key.trim(),
//   ];

//   const hashSequence = params.additionalCharges
//     ? [params.additionalCharges.trim(), ...baseParts]
//     : baseParts;

//   const hashString = hashSequence.join("|");
//   return crypto.createHash("sha512").update(hashString).digest("hex");
// }

// // --- Generate hash endpoint ---
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;

//     if (!txnid || !amount || !firstname || !email || !productinfo) {
//       return res
//         .status(400)
//         .json({ error: "Missing required fields for hash" });
//     }

//     const hash = generatePayuRequestHash({
//       key: MERCHANT_KEY,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6: "",
//       udf7: "",
//       udf8: "",
//       udf9: "",
//       udf10: "",
//       salt: SALT,
//     });

//     res.json({ hash });
//   } catch (error) {
//     console.error("Error generating hash:", error);
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// // --- PayU success callback ---
// app.post("/payu/success", async (req, res) => {
//   try {
//     const {
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       hash: receivedHash,
//       additionalCharges,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//       udf6 = "",
//       udf7 = "",
//       udf8 = "",
//       udf9 = "",
//       udf10 = "",
//     } = req.body;

//     if (status !== "success") {
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }

//     const expectedHash = generatePayuResponseHash({
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       additionalCharges,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6,
//       udf7,
//       udf8,
//       udf9,
//       udf10,
//       salt: SALT,
//     });

//     if (expectedHash !== receivedHash) {
//       console.error(
//         `Hash mismatch! Expected: ${expectedHash}, Received: ${receivedHash}`
//       );
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }

//     // Deduplication - check if txnid processed before
//     const checkUrl = `${SHEETDB_URL}/search?txnid=${encodeURIComponent(txnid)}`;
//     let alreadyProcessed = false;
//     try {
//       const checkRes = await fetch(checkUrl);
//       const existing = await checkRes.json();
//       alreadyProcessed = Array.isArray(existing) && existing.length > 0;
//     } catch (e) {
//       console.error("SheetDB check failed:", e);
//     }
//     if (alreadyProcessed) {
//       // Redirect success without reprocessing
//       return res.redirect(
//         `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//           txnid
//         )}&amount=${encodeURIComponent(
//           parseFloat(amount).toFixed(2)
//         )}&pax=${encodeURIComponent(udf5)}`
//       );
//     }

//     // Parse delegates JSON
//     let delegates = [];
//     try {
//       delegates = JSON.parse(udf4);
//       if (!Array.isArray(delegates)) delegates = [];
//     } catch (e) {
//       console.error("Failed to parse delegates JSON:", e);
//       delegates = [];
//     }

//     // Save delegates to SheetDB
//     if (delegates.length > 0) {
//       const rows = delegates.map((d) => ({
//         txnid,
//         amount: parseFloat(amount).toFixed(2),
//         organisation: udf2,
//         designation: udf3,
//         delegate_name: d.name,
//         delegate_email: d.email,
//         delegate_phone: d.phone,
//         payment_status: "Success",
//         payment_mode: "PayU",
//         payment_date: new Date().toISOString(),
//       }));

//       try {
//         const sheetdbRes = await fetch(SHEETDB_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ data: rows }),
//         });
//         if (!sheetdbRes.ok) {
//           const errtxt = await sheetdbRes.text();
//           console.error("Failed to save data to SheetDB:", errtxt);
//         } else {
//           console.log("Saved to SheetDB OK");
//         }
//       } catch (err) {
//         console.error("Error calling SheetDB:", err);
//       }
//     }

//     // Send confirmation email to first delegate
//     if (delegates.length > 0) {
//       const firstDelegate = delegates[0];

//       const emailParams = {
//         to_name: firstDelegate.name,
//         to_email: firstDelegate.email,
//         email: firstDelegate.email,
//         txnid,
//         amount: parseFloat(amount).toFixed(2),
//         event_name: productinfo,
//         organisation: udf2,
//         designation: udf3,
//         pax: udf5,
//       };

//       try {
//         const emailRes = await emailjs.send(
//           EMAILJS_SERVICE_ID,
//           EMAILJS_TEMPLATE_ID,
//           emailParams
//         );
//         console.log("Confirmation email sent:", emailRes);
//       } catch (emailErr) {
//         console.error("EmailJS error:", emailErr);
//       }
//     }

//     // All done, redirect to frontend success page
//     return res.redirect(
//       `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//         txnid
//       )}&amount=${encodeURIComponent(
//         parseFloat(amount).toFixed(2)
//       )}&pax=${encodeURIComponent(udf5)}`
//     );
//   } catch (error) {
//     console.error("Error in /payu/success:", error);
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }
// });

// // PayU failure handler
// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server listening on port ${PORT}`);
// });

// FUll working 1
// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const emailjs = require("@emailjs/nodejs");

// const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://www.miceandmore.co.in",
//       "https://miceandmore.co.in",
//     ],
//     methods: ["POST"],
//     credentials: true,
//   })
// );

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const SHEETDB_URL = process.env.SHEETDB_URL;
// const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
// const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
// const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

// if (
//   !MERCHANT_KEY ||
//   !SALT ||
//   !SHEETDB_URL ||
//   !EMAILJS_SERVICE_ID ||
//   !EMAILJS_TEMPLATE_ID ||
//   !EMAILJS_PUBLIC_KEY
// ) {
//   console.error(
//     "ERROR: Missing environment variable(s). Please check your .env file."
//   );
//   process.exit(1);
// }

// emailjs.init(EMAILJS_PUBLIC_KEY);

// // Helper functions to generate hashes (same as before)
// function generatePayuRequestHash(params) {
//   const udfFields = [
//     params.udf1 || "",
//     params.udf2 || "",
//     params.udf3 || "",
//     params.udf4 || "",
//     params.udf5 || "",
//     params.udf6 || "",
//     params.udf7 || "",
//     params.udf8 || "",
//     params.udf9 || "",
//     params.udf10 || "",
//   ];
//   const hashString = [
//     params.key.trim(),
//     params.txnid.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.productinfo.trim(),
//     params.firstname.trim(),
//     params.email.trim(),
//     ...udfFields,
//   ].join("|");
//   return crypto
//     .createHash("sha512")
//     .update(`${hashString}|${params.salt.trim()}`)
//     .digest("hex");
// }

// function generatePayuResponseHash(params) {
//   const udfFields = [
//     params.udf10 || "",
//     params.udf9 || "",
//     params.udf8 || "",
//     params.udf7 || "",
//     params.udf6 || "",
//     params.udf5 || "",
//     params.udf4 || "",
//     params.udf3 || "",
//     params.udf2 || "",
//     params.udf1 || "",
//   ];
//   let baseParts = [
//     params.salt.trim(),
//     params.status.trim(),
//     ...udfFields,
//     params.email.trim(),
//     params.firstname.trim(),
//     params.productinfo.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.txnid.trim(),
//     params.key.trim(),
//   ];
//   if (params.additionalCharges) {
//     baseParts = [params.additionalCharges.trim(), ...baseParts];
//   }
//   const hashString = baseParts.join("|");
//   return crypto.createHash("sha512").update(hashString).digest("hex");
// }

// // Endpoint to generate payment hash
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;
//     if (!txnid || !amount || !firstname || !email || !productinfo) {
//       return res.status(400).json({ error: "Missing fields for hash" });
//     }
//     const hash = generatePayuRequestHash({
//       key: MERCHANT_KEY,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6: "",
//       udf7: "",
//       udf8: "",
//       udf9: "",
//       udf10: "",
//       salt: SALT,
//     });
//     res.json({ hash });
//   } catch (error) {
//     console.error("Error generating hash:", error);
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// // Endpoint to handle PayU success callback and process delegates + send email
// app.post("/payu/success", async (req, res) => {
//   try {
//     const {
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       hash: receivedHash,
//       additionalCharges,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "", // delegates JSON string
//       udf5 = "", // pax count
//       udf6 = "",
//       udf7 = "",
//       udf8 = "",
//       udf9 = "",
//       udf10 = "",
//     } = req.body;

//     if (status !== "success") {
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }

//     // Verify hash
//     const expectedHash = generatePayuResponseHash({
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       additionalCharges,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6,
//       udf7,
//       udf8,
//       udf9,
//       udf10,
//       salt: SALT,
//     });
//     if (expectedHash !== receivedHash) {
//       console.error(
//         `Hash mismatch: expected ${expectedHash}, received ${receivedHash}`
//       );
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }

//     // Check if txnid already exists in SheetDB to prevent duplicates
//     let alreadyProcessed = false;
//     try {
//       const checkRes = await fetch(
//         `${SHEETDB_URL}/search?txnid=${encodeURIComponent(txnid)}`
//       );
//       const existing = await checkRes.json();
//       alreadyProcessed = Array.isArray(existing) && existing.length > 0;
//     } catch (err) {
//       console.error("SheetDB check error:", err);
//     }
//     if (alreadyProcessed) {
//       // Redirect success without re-processing
//       return res.redirect(
//         `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//           txnid
//         )}&amount=${encodeURIComponent(
//           parseFloat(amount).toFixed(2)
//         )}&pax=${encodeURIComponent(udf5)}`
//       );
//     }

//     // Parse delegates JSON safely
//     let delegates = [];
//     try {
//       delegates = JSON.parse(udf4);
//       if (!Array.isArray(delegates)) delegates = [];
//     } catch (err) {
//       console.error("Failed to parse delegates JSON:", err);
//       delegates = [];
//     }

//     // Save all delegates to SheetDB if present
//     if (delegates.length > 0) {
//       const rows = delegates.map((d) => ({
//         txnid,
//         amount: parseFloat(amount).toFixed(2),
//         organisation: udf2,
//         designation: udf3,
//         delegate_name: d.name,
//         delegate_email: d.email,
//         delegate_phone: d.phone,
//         payment_status: "Success",
//         payment_mode: "PayU",
//         payment_date: new Date().toISOString(),
//       }));

//       try {
//         const sheetdbRes = await fetch(SHEETDB_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ data: rows }),
//         });
//         if (!sheetdbRes.ok) {
//           const text = await sheetdbRes.text();
//           console.error("SheetDB save error:", text);
//         } else {
//           console.log("Saved delegates to SheetDB");
//         }
//       } catch (err) {
//         console.error("SheetDB request error:", err);
//       }
//     }

//     // Send email ONLY to first delegate
//     if (delegates.length > 0) {
//       const firstDelegate = delegates[0];
//       const emailParams = {
//         to_name: firstDelegate.name,
//         to_email: firstDelegate.email,
//         email: firstDelegate.email, // For template variable
//         txnid,
//         amount: parseFloat(amount).toFixed(2),
//         event_name: productinfo,
//         organisation: udf2,
//         designation: udf3,
//         pax: udf5,
//       };
//       try {
//         const emailRes = await emailjs.send(
//           EMAILJS_SERVICE_ID,
//           EMAILJS_TEMPLATE_ID,
//           emailParams
//         );
//         console.log("Sent confirmation email:", emailRes);
//       } catch (e) {
//         console.error("EmailJS send error:", e);
//       }
//     }

//     // Redirect user to frontend success page with minimal info
//     return res.redirect(
//       `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//         txnid
//       )}&amount=${encodeURIComponent(
//         parseFloat(amount).toFixed(2)
//       )}&pax=${encodeURIComponent(udf5)}`
//     );
//   } catch (error) {
//     console.error("Error in /payu/success:", error);
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }
// });

// // PayU failure callback just redirects
// app.post("/payu/fail", (req, res) => {
//   res.redirect("https://miceandmore.co.in/payment-fail");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at port ${PORT}`);
// });

// Mongodb and current code

// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const crypto = require("crypto");
// const cors = require("cors");
// const emailjs = require("@emailjs/nodejs");

// const app = express();
// app.use(bodyParser.json());
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://www.miceandmore.co.in",
//       "https://miceandmore.co.in",
//     ],
//     methods: ["POST", "GET"],
//     credentials: true,
//   })
// );

// // --- Mongoose connection ---
// const MONGO_URI = process.env.MONGO_URI;
// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB connected!"))
//   .catch((err) => {
//     console.error("MongoDB error:", err);
//     process.exit(1);
//   });

// // --- Mongoose schema/model ---
// const delegateSchema = new mongoose.Schema({
//   txnid: { type: String, required: true, index: true },
//   amount: String,
//   organisation: String,
//   designation: String,
//   pax: String,
//   productinfo: String,
//   delegates: [
//     {
//       name: String,
//       email: String,
//       phone: String,
//       organisation: String,
//       designation: String,
//     },
//   ],
//   payment_status: String,
//   payment_mode: String,
//   payment_date: { type: Date, default: Date.now },
// });
// const Payment = mongoose.model("Payment", delegateSchema);

// // --- PayU and EmailJS config ---
// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const SALT = process.env.PAYU_SALT;
// const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
// const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
// const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
// emailjs.init(EMAILJS_PUBLIC_KEY);

// // --- Helpers for PayU hash (same as before) ---
// function generatePayuRequestHash(params) {
//   const udfFields = [
//     params.udf1 || "",
//     params.udf2 || "",
//     params.udf3 || "",
//     params.udf4 || "",
//     params.udf5 || "",
//     params.udf6 || "",
//     params.udf7 || "",
//     params.udf8 || "",
//     params.udf9 || "",
//     params.udf10 || "",
//   ];
//   const hashString = [
//     params.key.trim(),
//     params.txnid.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.productinfo.trim(),
//     params.firstname.trim(),
//     params.email.trim(),
//     ...udfFields,
//   ].join("|");
//   return crypto
//     .createHash("sha512")
//     .update(`${hashString}|${params.salt.trim()}`)
//     .digest("hex");
// }
// function generatePayuResponseHash(params) {
//   const udfFields = [
//     params.udf10 || "",
//     params.udf9 || "",
//     params.udf8 || "",
//     params.udf7 || "",
//     params.udf6 || "",
//     params.udf5 || "",
//     params.udf4 || "",
//     params.udf3 || "",
//     params.udf2 || "",
//     params.udf1 || "",
//   ];
//   let baseParts = [
//     params.salt.trim(),
//     params.status.trim(),
//     ...udfFields,
//     params.email.trim(),
//     params.firstname.trim(),
//     params.productinfo.trim(),
//     parseFloat(params.amount).toFixed(2),
//     params.txnid.trim(),
//     params.key.trim(),
//   ];
//   if (params.additionalCharges)
//     baseParts = [params.additionalCharges.trim(), ...baseParts];
//   const hashString = baseParts.join("|");
//   return crypto.createHash("sha512").update(hashString).digest("hex");
// }

// // --- PayU endpoints for hash and payment save ---
// app.post("/generate-hash", (req, res) => {
//   try {
//     const {
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//     } = req.body;
//     if (!txnid || !amount || !firstname || !email || !productinfo) {
//       return res.status(400).json({ error: "Missing fields for hash" });
//     }
//     const hash = generatePayuRequestHash({
//       key: MERCHANT_KEY,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6: "",
//       udf7: "",
//       udf8: "",
//       udf9: "",
//       udf10: "",
//       salt: SALT,
//     });
//     res.json({ hash });
//   } catch (error) {
//     console.error("Hash gen err:", error);
//     res.status(500).json({ error: "Hash generation failed" });
//   }
// });

// app.post("/payu/success", async (req, res) => {
//   try {
//     const {
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       hash: receivedHash,
//       additionalCharges,
//       udf1 = "",
//       udf2 = "",
//       udf3 = "",
//       udf4 = "",
//       udf5 = "",
//       udf6 = "",
//       udf7 = "",
//       udf8 = "",
//       udf9 = "",
//       udf10 = "",
//     } = req.body;

//     console.log("💳 PayU Transaction ID (mihpayid):", req.body.mihpayid);
//     console.log("💳 Alternative (payuMoneyId):", req.body.payuMoneyId);

//     console.log(status, "Checking Status");
//     if (status !== "success") {
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }
//     const expectedHash = generatePayuResponseHash({
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       status,
//       additionalCharges,
//       udf1,
//       udf2,
//       udf3,
//       udf4,
//       udf5,
//       udf6,
//       udf7,
//       udf8,
//       udf9,
//       udf10,
//       salt: SALT,
//     });
//     if (expectedHash !== receivedHash) {
//       console.error(
//         "Hash mismatch: expected",
//         expectedHash,
//         "received",
//         receivedHash
//       );
//       return res.redirect("https://miceandmore.co.in/payment-fail");
//     }
//     // Dedup: do not insert txnid again
//     const found = await Payment.findOne({ txnid });
//     if (found) {
//       return res.redirect(
//         `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//           txnid
//         )}&amount=${encodeURIComponent(
//           parseFloat(amount).toFixed(2)
//         )}&pax=${encodeURIComponent(udf5)}`
//       );
//     }
//     // Parse delegates
//     let delegates = [];
//     try {
//       delegates = JSON.parse(udf4);
//       if (!Array.isArray(delegates)) delegates = [];
//     } catch (e) {
//       console.error("Delegates parse error:", e);
//       delegates = [];
//     }
//     // Save payment record
//     await Payment.create({
//       txnid,
//       amount: parseFloat(amount).toFixed(2),
//       organisation: udf2,
//       designation: udf3,
//       pax: udf5,
//       productinfo,
//       delegates,
//       payment_status: "Success",
//       payment_mode: "PayU",
//       payment_date: new Date(),
//     });
//     // Email first delegate
//     if (delegates.length > 0) {
//       const first = delegates[0];
//       const emailParams = {
//         to_name: first.name,
//         to_email: first.email,
//         email: first.email,
//         txnid,
//         amount: parseFloat(amount).toFixed(2),
//         event_name: productinfo,
//         organisation: udf2,
//         designation: udf3,
//         pax: udf5,
//       };
//       try {
//         await emailjs.send(
//           EMAILJS_SERVICE_ID,
//           EMAILJS_TEMPLATE_ID,
//           emailParams
//         );
//         console.log("Email sent to:", first.email);
//       } catch (e) {
//         console.error("EmailJS failed:", e);
//       }
//     }
//     return res.redirect(
//       `https://miceandmore.co.in/payment-success?txnid=${encodeURIComponent(
//         txnid
//       )}&amount=${encodeURIComponent(
//         parseFloat(amount).toFixed(2)
//       )}&pax=${encodeURIComponent(udf5)}`
//     );
//   } catch (e) {
//     console.error("Error in /payu/success:", e);
//     return res.redirect("https://miceandmore.co.in/payment-fail");
//   }
// });
// // all good
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
