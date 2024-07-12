// app/api/popular/route.ts

import { NextResponse } from 'next/server'

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

if (!API_KEY) {
  console.error('NEXT_PUBLIC_TMDB_API_KEY is not set in the environment variables');
  throw new Error('NEXT_PUBLIC_TMDB_API_KEY is not set');
}

async function getPopularPeople(): Promise<Response> {
  const url = 'https://api.themoviedb.org/3/person/popular?language=en-US&page=1';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };

  console.log('Fetching from URL:', url); // Log the URL (remove this in production)

  return fetch(url, options);
}

export async function GET() {
  try {
    console.log('Fetching popular people...');
    const response = await getPopularPeople();
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json({ error: `API Error: ${responseText}` }, { status: response.status });
    }

    const result = JSON.parse(responseText);
    console.log('Successfully fetched popular people');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'An error occurred while fetching popular people: ' + (error as Error).message }, { status: 500 });
  }
}