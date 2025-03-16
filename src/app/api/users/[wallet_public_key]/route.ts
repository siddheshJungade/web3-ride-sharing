// app/api/users/[wallet_public_key]/route.js

import sqlite3 from 'sqlite3';
import { openDb } from "@/lib/db";
interface Params {
  wallet_public_key: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  const { wallet_public_key } = params;

  const db = await openDb();

  try {
    const user = await db.get('SELECT * FROM users WHERE wallet_public_key = ?', wallet_public_key);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ user_type: user.user_type }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}


// Export the POST handler
export async function POST(req: Request, { params }: { params: { wallet_public_key: string } }) {
  const { wallet_public_key } = params;
  const { user_type } = await req.json();

  // Basic validation for user_type
  if (!user_type || !['CUSTOMER', 'DRIVER'].includes(user_type)) {
    return new Response(
      JSON.stringify({ message: 'Invalid user type. It should be either "CUSTOMER" or "DRIVER".' }),
      { status: 400 }
    );
  }

  const db = await openDb();
  try {
    // Check if the user already exists in the database
    const existingUser = await db.get('SELECT * FROM users WHERE wallet_public_key = ?', wallet_public_key);
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'User with this wallet public key already exists' }),
        { status: 400 }
      );
    }

    // Insert the new user into the database
    await db.run('INSERT INTO users (wallet_public_key, user_type) VALUES (?, ?)', wallet_public_key, user_type);

    return new Response(JSON.stringify({ message: 'User created successfully' }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}


export async function PATCH(req: Request, { params }: { params: Params }) {
  const { wallet_public_key } = params;
  const { user_type } = await req.json(); // Fetch the user_type from request body

  if (!user_type || !['CUSTOMER', 'DRIVER'].includes(user_type)) {
    return new Response(JSON.stringify({ message: 'Invalid user type. It should be either "CUSTOMER" or "DRIVER".' }), { status: 400 });
  }

  const db = await openDb();

  try {
    const user = await db.get('SELECT * FROM users WHERE wallet_public_key = ?', wallet_public_key);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    await db.run('UPDATE users SET user_type = ? WHERE wallet_public_key = ?', user_type, wallet_public_key);

    return new Response(JSON.stringify({ message: 'User type updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}