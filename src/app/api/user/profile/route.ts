import { NextResponse } from 'next/server';
// Type definition for user profile
// Ideally, move this to a separate contracts file (e.g., src/contracts/user.ts)
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

// GET /api/user/profile
export async function GET() {
  try {
    // TODO: Integrate real authentication/session logic here
    const user: UserProfile = {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[GET /api/user/profile] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
