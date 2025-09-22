// Database utility functions for common operations
import { createClient } from "./supabase/server"
import { 
  Category, 
  Product, 
  ProductWithCategory, 
  Profile, 
  Order, 
  OrderWithItems,
  CategoryInsert,
  ProductInsert,
  ProfileInsert,
  OrderInsert,
  OrderItemInsert
} from "./database.types"

// Category operations
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw error
  return data || []
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createCategory(category: CategoryInsert): Promise<Category> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

// Product operations
export async function getProducts(categoryId?: string): Promise<ProductWithCategory[]> {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getProductById(id: string): Promise<ProductWithCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(product: ProductInsert): Promise<Product> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductStock(productId: string, quantity: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: quantity })
    .eq("id", productId)

  if (error) throw error
}

// Profile operations
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}

export async function createProfile(profile: ProfileInsert): Promise<Profile> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Order operations
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      ),
      profile:profiles(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      ),
      profile:profiles(*)
    `)
    .eq("id", orderId)
    .single()

  if (error) throw error
  return data
}

export async function createOrder(order: OrderInsert, items: OrderItemInsert[]): Promise<Order> {
  const supabase = await createClient()
  
  // Start a transaction
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single()

  if (orderError) throw orderError

  // Insert order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) throw itemsError

  return orderData
}

// Admin operations
export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      ),
      profile:profiles(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<Order> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Analytics operations
export async function getDashboardStats() {
  const supabase = await createClient()
  
  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalUsers },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
  ])

  const totalRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    totalUsers: totalUsers || 0,
    totalRevenue
  }
}
