import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // TODO: Implement user role check with MongoDB
  return NextResponse.next();
}
