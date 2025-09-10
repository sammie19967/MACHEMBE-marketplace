import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Get cookie store and wait for it
    const cookieStore = await cookies();
    
    // Check if session cookie exists
    const sessionCookie = await cookieStore.get('session');
    
    if (sessionCookie) {
      // Delete the session cookie asynchronously
      await cookieStore.delete('session');
    }

    return NextResponse.json({ 
      message: "Logged out successfully",
      success: true 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to logout',
        success: false 
      },
      { status: 500 }
    );
  }
}