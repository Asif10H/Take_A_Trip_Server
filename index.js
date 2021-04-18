const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 7077;
console.log(process.env.DB_NAME);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gvtvy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('reviews'));
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db("places").collection("placesCollection");
    const reviewCollection = client.db("places").collection("review");
    console.log('database connected');

    app.get('/places', (req, res) => {
        productCollection.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })

    app.post('/addPlace', (req, res) => {
        const newProduct = req.body;
        console.log(newProduct);
        productCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })
    
    
    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const review = req.body.review;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewCollection.insertOne({ name, review, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.get('/places/:id', (req, res) => {
        productCollection.find({_id: ObjectId(req.params.id)})
        .toArray( (err, documents) => {
            res.send(documents[0]);
        })
    })

});

app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
