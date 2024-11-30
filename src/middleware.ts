import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/api/agent/:path*', '/api/attachment', '/api/classification'],
};

export function middleware(request: NextRequest) {
  console.log('Middleware executed');

  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.MAITHAI_API_KEY) {
    console.log('Unauthorized request');
    console.log('Request URL: ', request.url);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (request.url.includes('/api/transcript')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  return NextResponse.next();
}