import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const alertSettingsSchema = z.object({
  low_stock_threshold: z.number().min(0).max(100).default(20), // Percentage
  critical_stock_threshold: z.number().min(0).max(100).default(5), // Percentage
  email_notifications: z.boolean().default(true),
  dashboard_notifications: z.boolean().default(true),
  notification_frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
  email_recipients: z.array(z.string().email()).default([]),
  auto_reorder_enabled: z.boolean().default(false),
  reorder_buffer_percentage: z.number().min(0).max(100).default(10),
  category_specific_thresholds: z.record(z.string(), z.object({
    low_stock_threshold: z.number().min(0).max(100),
    critical_stock_threshold: z.number().min(0).max(100),
    enabled: z.boolean()
  })).default({}),
  product_specific_thresholds: z.record(z.string(), z.object({
    low_stock_threshold: z.number().min(0).max(100),
    critical_stock_threshold: z.number().min(0).max(100),
    enabled: z.boolean()
  })).default({}),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current alert settings
    const { data: settings, error: settingsError } = await supabase
      .from('inventory_alert_settings')
      .select('*')
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch settings: ${settingsError.message}`)
    }

    // Return default settings if none exist
    const defaultSettings = {
      low_stock_threshold: 20,
      critical_stock_threshold: 5,
      email_notifications: true,
      dashboard_notifications: true,
      notification_frequency: 'immediate',
      email_recipients: [],
      auto_reorder_enabled: false,
      reorder_buffer_percentage: 10,
      category_specific_thresholds: {},
      product_specific_thresholds: {},
      updated_at: new Date().toISOString(),
      updated_by: user.id
    }

    return NextResponse.json(settings || defaultSettings)

  } catch (error) {
    console.error('Alert settings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = alertSettingsSchema.parse(body)

    // Check if settings table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('inventory_alert_settings')
      .select('id')
      .limit(1)

    if (tableError) {
      return NextResponse.json({ 
        error: 'Alert settings table not available. Please run the database setup script first.' 
      }, { status: 503 })
    }

    // Upsert the settings (insert or update)
    const { data: settings, error: upsertError } = await supabase
      .from('inventory_alert_settings')
      .upsert({
        ...validatedData,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Failed to save settings: ${upsertError.message}`)
    }

    return NextResponse.json(settings, { status: 200 })

  } catch (error) {
    console.error('Alert settings save error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get alert statistics
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current alert settings
    const { data: settings, error: settingsError } = await supabase
      .from('inventory_alert_settings')
      .select('*')
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch settings: ${settingsError.message}`)
    }

    const defaultSettings = {
      low_stock_threshold: 20,
      critical_stock_threshold: 5,
      email_notifications: true,
      dashboard_notifications: true,
      notification_frequency: 'immediate',
      email_recipients: [],
      auto_reorder_enabled: false,
      reorder_buffer_percentage: 10,
      category_specific_thresholds: {},
      product_specific_thresholds: {}
    }

    const currentSettings = settings || defaultSettings

    // Get inventory statistics
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, current_quantity, min_stock_level, max_stock_level, product_name, category_name, status')

    if (inventoryError) {
      throw new Error(`Failed to fetch inventory: ${inventoryError.message}`)
    }

    // Calculate alert statistics
    const totalItems = inventoryData?.length || 0
    let lowStockCount = 0
    let criticalStockCount = 0
    let outOfStockCount = 0

    inventoryData?.forEach(item => {
      const quantity = item.current_quantity || 0
      const maxLevel = item.max_stock_level || 100
      const threshold = (quantity / maxLevel) * 100

      if (quantity === 0) {
        outOfStockCount++
      } else if (threshold <= currentSettings.critical_stock_threshold) {
        criticalStockCount++
      } else if (threshold <= currentSettings.low_stock_threshold) {
        lowStockCount++
      }
    })

    // Get categories for category-specific settings
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('status', 'active')

    const categoryOptions = categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      ...currentSettings.category_specific_thresholds[cat.id]
    })) || []

    return NextResponse.json({
      settings: currentSettings,
      statistics: {
        total_items: totalItems,
        low_stock_count: lowStockCount,
        critical_stock_count: criticalStockCount,
        out_of_stock_count: outOfStockCount,
        low_stock_percentage: totalItems > 0 ? (lowStockCount / totalItems) * 100 : 0,
        critical_stock_percentage: totalItems > 0 ? (criticalStockCount / totalItems) * 100 : 0,
        out_of_stock_percentage: totalItems > 0 ? (outOfStockCount / totalItems) * 100 : 0
      },
      category_options: categoryOptions,
      last_updated: currentSettings.updated_at || new Date().toISOString()
    })

  } catch (error) {
    console.error('Alert statistics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
