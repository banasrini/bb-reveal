import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();

    const [tallyResult, messagesResult, votesResult] = await Promise.all([
      db.execute('SELECT vote, COUNT(*) as count FROM votes GROUP BY vote'),
      db.execute(
        'SELECT name, message, created_at FROM messages ORDER BY created_at DESC LIMIT 100'
      ),
      db.execute('SELECT name, vote, created_at FROM votes ORDER BY created_at DESC'),
    ]);

    let boyCount = 0;
    let girlCount = 0;
    for (const row of tallyResult.rows) {
      if (row.vote === 'boy') boyCount = Number(row.count);
      if (row.vote === 'girl') girlCount = Number(row.count);
    }

    const messages = messagesResult.rows.map((r) => ({
      name: r.name as string,
      message: r.message as string,
      created_at: r.created_at as string,
    }));

    const votes = votesResult.rows.map((r) => ({
      name: r.name as string,
      vote: r.vote as string,
      created_at: r.created_at as string,
    }));

    return NextResponse.json({ boyCount, girlCount, messages, votes });
  } catch (err) {
    console.error('Data fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
