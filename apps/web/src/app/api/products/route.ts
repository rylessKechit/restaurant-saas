// apps/web/src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { Product, Category } from '@restaurant-saas/database';
import { simpleHandler } from '@/lib/api-middleware';

export const GET = simpleHandler(async (request: NextRequest) => {
  try {
    await initDB();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const isActive = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build filter
    let filter: Record<string, any> = {};
    if (categoryId) filter.category = categoryId;
    if (isActive !== null) filter.isActive = isActive === 'true';
    
    // Get products with pagination
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate('category');
      
    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
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
    
    // Validation basique
    if (!body.name || body.price === undefined || !body.category) {
      return NextResponse.json(
        { error: 'Name, price and category are required' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie existe
    const category = await Category.findById(body.category);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Créer le produit
    const product = await Product.create(body);

    // Populate category pour la réponse
    await product.populate('category');

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});