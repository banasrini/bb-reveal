import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, vote, message, force } = await req.json();

    if (!name?.trim() || !['boy', 'girl'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const db = await getDb();
    const nameKey = name.trim().toLowerCase();

    const existing = await db.execute({
      sql: 'SELECT vote FROM votes WHERE name_key = ?',
      args: [nameKey],
    });

    if (existing.rows.length > 0) {
      const existingVote = existing.rows[0].vote as string;

      if (force && existingVote !== vote) {
        // Change the vote
        await db.execute({
          sql: 'UPDATE votes SET vote = ? WHERE name_key = ?',
          args: [vote, nameKey],
        });
        if (message?.trim()) {
          await db.execute({
            sql: 'INSERT INTO messages (name, message) VALUES (?, ?)',
            args: [name.trim(), message.trim()],
          });
        }
        return NextResponse.json({ updated: true, previousVote: existingVote });
      }

      // Still save a new message even if not changing vote
      if (message?.trim()) {
        await db.execute({
          sql: 'INSERT INTO messages (name, message) VALUES (?, ?)',
          args: [name.trim(), message.trim()],
        });
      }
      return NextResponse.json({ alreadyVoted: true, existingVote });
    }

    await db.execute({
      sql: 'INSERT INTO votes (name, name_key, vote) VALUES (?, ?, ?)',
      args: [name.trim(), nameKey, vote],
    });

    if (message?.trim()) {
      await db.execute({
        sql: 'INSERT INTO messages (name, message) VALUES (?, ?)',
        args: [name.trim(), message.trim()],
      });
    }

    return NextResponse.json({ alreadyVoted: false });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
