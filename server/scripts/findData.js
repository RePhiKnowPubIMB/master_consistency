const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://abdullahalsaim2004_db_user:Mok1ePWtaVk91WKK@cluster0.ilwy7n8.mongodb.net/?appName=Cluster0";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const adminDb = client.db('test').admin();
        const listDatabases = await adminDb.listDatabases();
        
        for (const dbInfo of listDatabases.databases) {
            const dbName = dbInfo.name;
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();
            console.log(`\nDatabase: ${dbName}`);
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                if (count > 0) {
                    console.log(` - ${col.name}: ${count} documents`);
                }
            }
        }
    } finally {
        await client.close();
    }
}
main().catch(console.error);
