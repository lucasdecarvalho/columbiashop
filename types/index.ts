export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  created_at: string
}

export interface Admin {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  stock: number
  image_url?: string
  created_at: string
}

export interface Card {
  id: string
  client_id: string
  mp_token?: string
  last_four: string
  brand: string
  holder_name: string
  expiration_month: number
  expiration_year: number
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  client_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  total: number
  mp_payment_id?: string
  created_at: string
  order_items?: OrderItem[]
  clients?: { name: string; email: string }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  products?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
