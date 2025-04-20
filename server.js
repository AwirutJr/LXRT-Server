const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const { readdirSync } = require("fs");
const HandleError = require("./middleware/error");
require("dotenv").config();

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));


// Auto-load routes
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

// Error handling middleware
app.use(HandleError);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`));

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// app.use(limiter);



// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");

// app.use(helmet());
// app.use(cors({ origin: ["https://yourfrontend.com"], credentials: true }));
// app.use(
//   cors({
//     origin: ["https://your-frontend-domain.com"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );


// app.use(express.json({ limit: "50mb" }));
// app.use(
//   fileUpload({
//     /* เพิ่ม options ที่ปลอดภัย */
//   })
// );

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// app.use(limiter);

