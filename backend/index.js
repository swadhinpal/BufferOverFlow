const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

//const uploadRoutes = require('./routes/upload1');
//const getContentRoutes = require('./routes/getContent1');
//const getAllContentRoutes = require('./routes/getAllContent1');
const { router: signin, authenticateToken } = require('./routes/signin');
const signup = require('./routes/signup');
const notification = require('./routes/notification');
//const notificationClickedRoutes = require('./routes/notificationClicked1');
const post = require('./routes/post');


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(signup);
app.use(signin);
// Public routes
app.use(authenticateToken);

// Protected routes (Require authentication)
//app.use('/api', uploadRoutes);
//app.use('/api', uploadRoutes);
app.use(post);
//app.use(getContentRoutes);
//app.use('/api', getAllContentRoutes);
app.use(notification);
//app.use('/api',notificationClickedRoutes);  

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
