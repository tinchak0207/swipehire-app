import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// Replace with your MongoDB connection string
const uri = process.env['MONGODB_URI'];
if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}
const client = new MongoClient(uri);

async function connectToDB() {
  await client.connect();
  return client.db('your-db-name'); // Replace with your database name
}

export async function POST(request: Request) {
  try {
    const { name, nodes, edges, isTemplate, isPublic } = await request.json();
    const definition = { nodes, edges };
    const userId = '5f9d88b4c1e1a5e88a1b2c3d'; // Hardcoded for now, replace with actual user ID from session or token

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const userObjectId = new ObjectId(userId);

    const db = await connectToDB();

    const user = await db.collection('users').findOne({ _id: userObjectId });

    const workflowCount = await db
      .collection('workflows')
      .countDocuments({ userId: userObjectId, isTemplate: false });

    if (user?.['tier'] === 'free' && workflowCount >= 3) {
      return NextResponse.json(
        { error: 'Free tier limit reached. Upgrade to create more workflows.' },
        { status: 403 }
      );
    }

    await db.collection('workflows').insertOne({
      name,
      userId: userObjectId,
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
