import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json();
    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }
    const db = await getDb();
    await db.execute({
      sql: 'INSERT INTO messages (name, message) VALUES (?, ?)',
      args: [name.trim(), message.trim()],
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Message error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
