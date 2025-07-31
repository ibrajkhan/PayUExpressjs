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
