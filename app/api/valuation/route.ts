import { NextRequest, NextResponse } from 'next/server';
import { generateValuation, ValuationInput } from '@/lib/ai-valuation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ValuationInput;

    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await generateValuation(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Valuation error:', error);
    return NextResponse.json({ error: 'Failed to generate valuation' }, { status: 500 });
  }
}

function validateInput(input: ValuationInput): { valid: boolean; error?: string } {
  if (!input.propertyType) {
    return { valid: false, error: 'Property type is required' };
  }

  if (!input.transactionType) {
    return { valid: false, error: 'Transaction type is required' };
  }

  if (!input.city) {
    return { valid: false, error: 'City is required' };
  }

  if (!input.totalArea || input.totalArea <= 0) {
    return { valid: false, error: 'Valid total area is required' };
  }

  return { valid: true };
}
