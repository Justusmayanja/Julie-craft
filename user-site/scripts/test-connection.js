// Test script to verify Supabase connection
// Run with: node scripts/test-connection.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.log('Please ensure you have:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('in your .env.local file')
    return
  }

  console.log('✅ Environment variables found')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`)

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test basic connection
    console.log('\n🧪 Testing basic connection...')
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }

    console.log('✅ Connection successful!')

    // Test tables exist
    console.log('\n📋 Checking database tables...')
    const tables = ['categories', 'products', 'profiles', 'orders', 'order_items']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': exists`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }

    // Test sample data
    console.log('\n📊 Checking sample data...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    if (catError) {
      console.log(`❌ Categories: ${catError.message}`)
    } else {
      console.log(`✅ Categories: ${categories?.length || 0} found`)
    }

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
    
    if (prodError) {
      console.log(`❌ Products: ${prodError.message}`)
    } else {
      console.log(`✅ Products: ${products?.length || 0} found`)
    }

    console.log('\n🎉 Database test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testConnection()
