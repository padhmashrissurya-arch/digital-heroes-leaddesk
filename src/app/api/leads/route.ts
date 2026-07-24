import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leadSubmissionSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = leadSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, budget, message } = validationResult.data;

    const newLead = await db.lead.create({
      data: {
        name,
        email,
        budget,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully!',
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing lead.' },
      { status: 500 }
    );
  }
}
