const apiRoutes = require('./routes/apiRoutes');
const htmlRoutes = require('./routes/htmlRoutes');

const express = require('express');

const PORT = process.env.PORT || 3001;

//instnatiate server
const app = express();


//--- Middleware functions ---//
// parse incoming string or array data
app.use(express.urlencoded({
    extended: true
})); //converts incoming POST data to key/value pairings that can be accessed in the req.body object and extended: true informs our server that there may be sub-array data nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.

// parse incoming JSON data
app.use(express.json()); //takes incoming POST data in the form of JSON and parses it into the req.body

app.use('/api', apiRoutes);
app.use('/', htmlRoutes);

// make files readily available
app.use(express.static('public'));



app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
})