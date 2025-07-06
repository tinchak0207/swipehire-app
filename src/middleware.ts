import { NextResponse } from 'next/server';

export async function middleware() {
  // TODO: Implement user role check with MongoDB
  return NextResponse.next();
}
