const { MongoClient, GridFSBucket } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // MongoDB 서버 URI
const dbName = 'test';

const client = new MongoClient(uri);

class Mongo {
    constructor() {
        this.connectToDatabase();
    }

    async connectToDatabase() {
        try {
            await client.connect();
            console.log('Successfully connected to MongoDB');
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
        }
    }

    async connectToGridfs(collection) {
        try {
            if (client.connect()) {
                console.log('여기옴232')
            }

            return new GridFSBucket(client.db(dbName), {
                bucketName: collection
            })
        } catch (error) {
            console.error('Failed to connect to GridFs', error);
        }
    }

    async insertData(collection, data) {
        try {
        const usersCollection = client.db(dbName).collection(collection);
        const result = await usersCollection.insertOne(data);
        console.log('Inserted data:', result.insertedCount);
        } catch (error) {
        console.error('Failed to insert data', error);
        }
    }

    async findData(collection) {
        try {
        const usersCollection = client.db(dbName).collection(collection);
        const result = await usersCollection.find().toArray();
        console.log('Found data:', result);
        return result;
        } catch (error) {
        console.error('Failed to find data', error);
        }
    }

    async findOne(collection, data) {
        try {
        const usersCollection = client.db(dbName).collection(collection);
        const result = await usersCollection.findOne({no: data.no, pw: data.pw});

        // return console.log(result)
        console.log('Found data:', result);
        return result;
        } catch (error) {
        console.error('Failed to find data', error);
        }
    }
}

const db = new Mongo();

module.exports = db;