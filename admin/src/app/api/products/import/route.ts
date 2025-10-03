import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProductSchema } from '@/lib/validations/product'
import { z } from 'zod'

// Import schema for CSV/JSON data
const importProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category_name: z.string().optional(), // We'll resolve this to category_id
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  cost_price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).default(0),
  min_stock_level: z.number().int().min(0).default(5),
  max_stock_level: z.number().int().min(0).default(100),
  reorder_point: z.number().int().min(0).default(10),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(), // JSON string
  images: z.string().optional(), // Semicolon-separated URLs
  featured_image: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).default('active'),
  featured: z.boolean().default(false),
  tags: z.string().optional(), // Semicolon-separated tags
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(), // Semicolon-separated keywords
})

const importRequestSchema = z.object({
  products: z.array(importProductSchema),
  update_existing: z.boolean().default(false), // Whether to update existing products by SKU
  skip_errors: z.boolean().default(false), // Whether to continue on errors
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = importRequestSchema.parse(body)

    const results = {
      total: validatedData.products.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number, error: string, data: any }>
    }

    // Get all categories for name-to-ID mapping
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
    }

    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]))

    // Process each product
    for (let i = 0; i < validatedData.products.length; i++) {
      const productData = validatedData.products[i]
      
      try {
        // Parse and clean the data
        const cleanData: any = {
          name: productData.name,
          description: productData.description || null,
          sku: productData.sku || null,
          price: productData.price,
          cost_price: productData.cost_price || null,
          stock_quantity: productData.stock_quantity,
          min_stock_level: productData.min_stock_level,
          max_stock_level: productData.max_stock_level,
          reorder_point: productData.reorder_point,
          weight: productData.weight || null,
          status: productData.status,
          featured: productData.featured,
          seo_title: productData.seo_title || null,
          seo_description: productData.seo_description || null,
        }

        // Parse dimensions if provided
        if (productData.dimensions) {
          try {
            cleanData.dimensions = JSON.parse(productData.dimensions)
          } catch {
            // If not valid JSON, store as null
            cleanData.dimensions = null
          }
        }

        // Parse images if provided
        if (productData.images) {
          cleanData.images = productData.images.split(';').filter(url => url.trim())
        }

        // Parse tags if provided
        if (productData.tags) {
          cleanData.tags = productData.tags.split(';').filter(tag => tag.trim())
        }

        // Parse SEO keywords if provided
        if (productData.seo_keywords) {
          cleanData.seo_keywords = productData.seo_keywords.split(';').filter(keyword => keyword.trim())
        }

        // Set featured image
        if (productData.featured_image) {
          cleanData.featured_image = productData.featured_image
        }

        // Resolve category
        if (productData.category_name) {
          const categoryId = categoryMap.get(productData.category_name.toLowerCase())
          if (categoryId) {
            cleanData.category_id = categoryId
            cleanData.category_name = productData.category_name
          }
        }

        // Check if product already exists (by SKU if provided)
        let existingProduct = null
        if (productData.sku) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('sku', productData.sku)
            .single()
          
          existingProduct = existing
        }

        if (existingProduct && validatedData.update_existing) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update({
              ...cleanData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id)

          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`)
          }

          results.updated++
        } else if (!existingProduct) {
          // Create new product
          const { error: createError } = await supabase
            .from('products')
            .insert(cleanData)

          if (createError) {
            throw new Error(`Create failed: ${createError.message}`)
          }

          results.created++
        } else {
          // Product exists but update_existing is false
          results.skipped++
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push({
          row: i + 1,
          error: errorMessage,
          data: productData
        })

        if (!validatedData.skip_errors) {
          // Stop processing on first error if skip_errors is false
          break
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`
    })

  } catch (error) {
    console.error('Import error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid import data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
