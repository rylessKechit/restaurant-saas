// apps/web/src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { Category } from '@restaurant-saas/database';
import { simpleHandler } from '@/lib/api-middleware';

export const GET = simpleHandler(async (request: NextRequest) => {
  try {
    await initDB();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    
    let filter: Record<string, any> = {};
    if (isActive !== null) filter.isActive = isActive === 'true';
    
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      categories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = simpleHandler(async (request: NextRequest) => {
  try {
    await initDB();
    
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const category = await Category.create(body);

    return NextResponse.json({
      success: true,
      category
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});