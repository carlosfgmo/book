export type UserRole = 'reader' | 'writer' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole[]
  phone: string | null
  address: string | null
  delivery_preference: 'platform' | 'direct'
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
}

export type BookStatus = 'draft' | 'presale' | 'published' | 'archived'
export type DeliveryType = 'pdf' | 'physical' | 'both'

export interface Book {
  id: string
  author_id: string
  category_id: string
  title: string
  slug: string
  description: string
  price: number
  presale_price: number | null
  status: BookStatus
  delivery_type: DeliveryType
  cover_url: string | null
  pdf_url: string | null
  stock: number | null
  release_date: string | null
  created_at: string
  // relations
  author?: User
  category?: Category
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled'
export type DeliveryMode = 'platform' | 'direct'

export interface Order {
  id: string
  buyer_id: string
  status: OrderStatus
  total: number
  shipping_address: string | null
  delivery_mode: DeliveryMode
  created_at: string
  // relations
  buyer?: User
  items?: OrderItem[]
  payment?: Payment
}

export type ItemDeliveryStatus = 'pending' | 'processing' | 'delivered' | 'failed'

export interface OrderItem {
  id: string
  order_id: string
  book_id: string
  quantity: number
  unit_price: number
  delivery_status: ItemDeliveryStatus
  download_token: string | null
  token_expires_at: string | null
  // relations
  book?: Book
}

export type PaymentMethod = 'yape' | 'plin' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'

export interface Payment {
  id: string
  order_id: string
  method: PaymentMethod
  amount: number
  operation_number: string
  voucher_url: string | null
  status: PaymentStatus
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

export interface Comment {
  id: string
  book_id: string
  user_id: string
  parent_id: string | null
  rating: number | null
  content: string
  is_verified_purchase: boolean
  is_visible: boolean
  created_at: string
  // relations
  user?: User
  replies?: Comment[]
}

export interface BookRating {
  book_id: string
  avg_rating: number
  total_ratings: number
  total_comments: number
}

export type ConversationType = 'presale' | 'support' | 'general'

export interface Conversation {
  id: string
  book_id: string
  reader_id: string
  writer_id: string
  type: ConversationType
  last_message_at: string | null
  created_at: string
  // relations
  book?: Book
  reader?: User
  writer?: User
  messages?: Message[]
}

export type AttachmentType = 'image' | 'document' | 'audio'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  attachment_url: string | null
  attachment_type: AttachmentType | null
  is_read: boolean
  read_at: string | null
  created_at: string
  // relations
  sender?: User
}
