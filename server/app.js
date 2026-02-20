const express = require('express');
const cors = require('cors');
const telegramRoutes = require("./routes/telegram");
const webhookRoutes = require('./routes/webhook');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/telegram", telegramRoutes);
app.use('/webhook', webhookRoutes);
app.use('/dashboard', dashboardRoutes);

module.exports = app;
