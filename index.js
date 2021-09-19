// need to install:
// $ npm install express mongodb body-parser cors
// $ npm install nodemon --save-dev
const express = require('express');
const admin = require('firebase-admin');

// firebase service account:

var serviceAccount = require("./Configs/burj-al-arab-a7d07-firebase-adminsdk-kp2af-18e3c4c421.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const { MongoClient } = require('mongodb');

const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
// console.log(process.env.DB_PASS)

const port = 4000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f88y3.mongodb.net/Burj-Al-Arab?retryWrites=true&w=majority`;


const app = express()
app.use(cors());
app.use(bodyParser.json());

const pass = 'admin';




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("Burj-Al-Arab").collection("Bookigs");
    console.log('db connected successfully to Burj-al-arab')
    // post: 
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // get:
    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            // idToken comes from the client app
            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail === queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else{
                        res.status(401).send('un_authorized_access! Nice try braaaaaaaaaaaah!!! 😂')
                    }
                }).catch( (error) => {
                    res.status(401).send('un_authorized_access!');
                });
        }
        else {
            res.status(401).send('un_authorized_access! Nice try brother!!! 😂')
        }
    })

});





app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})