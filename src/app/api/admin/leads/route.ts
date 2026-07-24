import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || 'ALL';

    const whereClause: any = {};

    if (statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { message: { contains: query } },
        { budget: { contains: query } },
      ];
    }

    const leads = await db.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const [totalCount, newCount, contactedCount, closedCount] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: 'NEW' } }),
      db.lead.count({ where: { status: 'CONTACTED' } }),
      db.lead.count({ where: { status: 'CLOSED' } }),
    ]);

    return NextResponse.json({
      success: true,
      leads,
      stats: {
        total: totalCount,
        new: newCount,
        contacted: contactedCount,
        closed: closedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads database records.' },
      { status: 500 }
    );
  }
}
