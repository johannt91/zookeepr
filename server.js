const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

//instnatiate server
const app = express();


// MIDDLEWARE FUNCTIONS: allow us to keep our route endpoint callback functions
//more readable while letting us reuse functionality across routes to keep our code DRY

//--- Middleware functions ---//
// parse incoming string or array data
app.use(express.urlencoded({
    extended: true
})); //converts incoming POST data to key/value pairings that can be accessed in the req.body object and extended: true informs our server that there may be sub-array data nested in it as well, so it needs to look as deep into the POST data as possible to parse all of the data correctly.

// parse incoming JSON data
app.use(express.json()); //takes incoming POST data in the form of JSON and parses it into the req.body

// make files readily available
app.use(express.static('public'));

const {
    animals
} = require('./data/animals') //animals is a property containing an array


function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        // Save personalityTraits as a dedicated array.
        // If personalityTraits is a string, place it into a new array and save.
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // Loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) { //function to accept POST route's req.body value and the array for the data to be added to


    const animal = body;
    animalsArray.push(animal);

    fs.writeFileSync( //synchronous version of fs.writeFile and does not require a callback function
        path.join(__dirname, './data/animals.json'), //path.join() joins the value of __dirname, which represents the directory of the file we execute the code in, with the path to the animals.json file.
        JSON.stringify({
            animals: animalsArray
        }, null, 2)
    );
    //return finished code to post route for response
    return animal;
}

// below is the route the route

// app.METHOD(PATH, HANDLER)

// app is an instance of express
// METHOD(example GET, POST, etc...) is an HTTP request method
// PATH is a path on the server
// HANDLER is the function executed when the route is matched

//make a GET request every time we enter a URL into the browser and press the Enter key to see what will come back in response.
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) { // look for specific data that the server can send back to client
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals); // look for specific data that the server can send back to client
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

// client requests server to accept the data
app.post('/api/animals', (req, res) => { //post packages data as an object
    //req.body is where our incoming content will be
    //set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
            //add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);

    res.json(animal); //this sends the data back to the client
    }

});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
})