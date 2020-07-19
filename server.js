const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

let app = express();

const urlencondedParser = bodyParser.urlencoded({ extended: false });
const PORT = 8000;

/*

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:<password>@bugtracker-kcina.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

*/

const uri = `mongodb+srv://root:${process.env.DB_PASS}@bugtracker-kcina.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

let MongoClient = require('mongodb').MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });

class Todo {
    constructor(title, description, resolved) {
        this.title = title;
        this.description = description;
        this.resolved = resolved;
    }

    getJSON() {
        return {
            title: this.title,
            description: this.description,
            resolved: this.resolved
        };
    }
}

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {

    const vars = {
        title: "Home"
    };
    res.render('index');
});

app.get('/todos', (req, res) => {

    let todos;

    MongoClient.connect((err, db) => {
        if(err) throw err;
        let dbo = db.db("TodoList");
        dbo.collection("Todos").find({}).toArray((err, todoArray) => {
            if (err) throw err;
            todos = todoArray;

            const vars = {
                title: "Todos",
                todos: todos
            };

            res.render('todos', vars);
        });
    });
});

app.post('/todos', urlencondedParser, (req, res) => {
    
    MongoClient.connect((err, db) => {
        if (err) throw err;
        let dbo = db.db("TodoList");
        let todo = { title: req.body.title, description: req.body.description, resolved: false };

        dbo.collection("Todos").insertOne(todo, (err, res) => {
            if (err) throw err;
        });
    });

    res.redirect('todos');

});

app.get('/delete', (req, res) => {
    console.log(req.query.id);

    MongoClient.connect((err, db) => {
        if (err) throw err;
        let dbo = db.db("TodoList");
        let query = { "_id": ObjectID(req.query.id) };
        dbo.collection("Todos").deleteOne(query, (err, obj) => {
            if (err) throw err;
            console.log(obj.result.n);
        });
    });

    res.redirect('/todos');
});

app.get('*', (req, res) => {
    const vars = {
        title: "404 - Not Found"
    };
    res.render('404', vars);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
});