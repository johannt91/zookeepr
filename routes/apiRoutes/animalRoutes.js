const { filterByQuery, findById, createNewAnimal, validateAnimal } = require('../../public/lib/animals');
const { animals } = require('../../data/animals');
const router = require('express').Router();

// app.METHOD(PATH, HANDLER)

// app is an instance of express
// METHOD(example GET, POST, etc...) is an HTTP request method
// PATH is a path on the server
// HANDLER is the function executed when the route is matched

//make a GET request every time we enter a URL into the browser and press the Enter key to see what will come back in response.
router.get('/animals', (req, res) => {
    let results = animals;
    if (req.query) { // look for specific data that the server can send back to client
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

router.get('/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals); // look for specific data that the server can send back to client
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// client requests server to accept the data
router.post('/animals', (req, res) => { //post packages data as an object
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

module.exports = router;