
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Replace with your MongoDB connection string
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDB() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db("your-db-name"); // Replace with your database name
}

export async function POST(request: Request) {
  try {
    const { name, nodes, edges, isTemplate, isPublic } = await request.json();
    const definition = { nodes, edges };
    const userId = 'some-user-id'; // Hardcoded for now, replace with actual user ID from session or token

    const db = await connectToDB();

    const user = await db.collection('users').findOne({ _id: userId });

    const workflowCount = await db.collection('workflows').countDocuments({ userId: userId, isTemplate: false });

    if (user?.tier === 'free' && workflowCount >= 3) {
        return NextResponse.json({ error: 'Free tier limit reached. Upgrade to create more workflows.' }, { status: 403 });
    }

    await db.collection('workflows').insertOne({
      name,
      userId,
      definition,
      isTemplate,
      isPublic,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Workflow saved successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save workflow' }, { status: 500 });
  }
}
