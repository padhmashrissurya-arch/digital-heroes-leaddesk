import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leadStatusUpdateSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const validation = leadStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead status value.' },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    const existing = await db.lead.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Lead record not found.' },
        { status: 404 }
      );
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.lead.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: 'Lead record deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead.' },
      { status: 500 }
    );
  }
}
