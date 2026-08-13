/**
 * Orders Hook
 *
 * Manages order creation and retrieval.
 * Order numbers are generated server-side via next_order_number() Postgres function.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Order item type
interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

// Order type matching Supabase
export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string;
  total_amount: number;
  order_status: 'placed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_id: string | null;
  courier_name: string | null;
  shipped_at: string | null;
  email_sent: boolean;
  created_at: string;
}

// Order item from database
export interface OrderItemDB {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
}

// NOTE: `useCreateOrder` was removed.
//
// It inserted directly into `orders` / `order_items` with the public anon key,
// which forced the database to keep anonymous INSERT policies open. Anyone
// holding the anon key (it ships in the JS bundle) could therefore write
// arbitrary order rows.
//
// Checkout now posts to /api/create-order, which runs server-side with the
// service-role key and bypasses RLS safely. Do not reintroduce client-side
// order creation.

// Get orders for current user
export const useUserOrders = (userId?: string) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }

      return (data ?? []) as Order[];
    },
    enabled: !!userId,
  });
};

// NOTE: a `useOrderByNumber` hook used to live here. It ran `SELECT *` filtered
// only by order_number using the public anon key. Because order numbers are
// sequential (HH-01001, HH-01002 …), anything calling it could have been used to
// walk the whole orders table and harvest customer names, phones and addresses.
// It was unused, and guest tracking now goes through /api/track-order, which
// requires the email as well and returns status fields only. Do not reintroduce
// a public lookup keyed on order number alone.

// Get order items for an order
export const useOrderItems = (orderId: string) => {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) {
        console.error('Error fetching order items:', error);
        throw error;
      }

      return data as OrderItemDB[];
    },
    enabled: !!orderId,
  });
};

// Get order by ID
export const useOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', 'id', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
      }

      return data as Order | null;
    },
    enabled: !!orderId,
  });
};
