require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path= require('path')
const app = express();


app.use(bodyParser.json());
app.use(cors());

const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


const userRoutes = require('./routes/user').router;
const propertyRoutes = require('./routes/property');


app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);

app.use(express.static(path.join(__dirname,'dist/realestate-frontend')))
app.use('/*',function(req,res){
    res.sendFile(path.join(__dirname,'dist/realestate-frontend/index.html'))
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
