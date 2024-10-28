const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const getContentRoutes = require('./routes/getContent');
const getAllContentRoutes = require('./routes/getAllContent');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const notificationRoutes = require('./routes/notification');
const notificationClickedRoutes = require('./routes/notificationClicked');


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (Require authentication)
app.use('/api', uploadRoutes);
app.use('/api',getContentRoutes);
app.use('/api', getAllContentRoutes);
app.use('/api', notificationRoutes);
app.use('/api', notificationClickedRoutes);  

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
