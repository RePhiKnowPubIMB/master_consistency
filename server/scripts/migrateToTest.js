const { MongoClient } = require('mongodb');

async function migrate() {
    const uri = "mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/?appName=Cluster0";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const srcDb = client.db('consistency-architect');
        const destDb = client.db('test');

        console.log("Dropping existing ykwproblems in test (if any)...");
        await destDb.collection('ykwproblems').drop().catch(() => {});

        console.log("Reading ykwproblems from consistency-architect...");
        const docs = await srcDb.collection('ykwproblems').find({}).toArray();

        if (docs.length > 0) {
            console.log(`Found ${docs.length} problems. Inserting into test DB...`);
            await destDb.collection('ykwproblems').insertMany(docs);
            console.log("Migration complete!");
        } else {
            console.log("No documents found to migrate.");
        }
    } finally {
        await client.close();
    }
}
migrate().catch(console.error);
