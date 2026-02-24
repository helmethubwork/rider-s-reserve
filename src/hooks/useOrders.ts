/**
 * Orders Hook
 * 
 * Manages order creation and retrieval.
 * Generates readable order numbers (e.g., HH-10001).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Order item type
interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

// Create order input
interface CreateOrderInput {
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  user_id?: string;
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
  created_at: string;
  updated_at: string;
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

/**
 * Generate a readable order number
 * Format: HH-XXXXX (e.g., HH-10001)
 */
const generateOrderNumber = async (): Promise<string> => {
  // Get the latest order number
  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error getting last order:', error);
  }

  let nextNumber = 10001; // Start from 10001

  if (data?.order_number) {
    // Extract number from existing order number (e.g., HH-10001 -> 10001)
    const match = data.order_number.match(/HH-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `HH-${nextNumber}`;
};

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Generate order number
      const orderNumber = await generateOrderNumber();

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: input.user_id || null,
          customer_email: input.customer_email,
          customer_name: input.customer_name,
          customer_phone: input.customer_phone || null,
          shipping_address: input.shipping_address,
          total_amount: input.total_amount,
          order_status: 'placed',
          payment_status: 'pending', // Always pending - payment integration later
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create order');
      }

      // Create order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        color: item.color || null,
        size: item.size || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(itemsError.message || 'Failed to create order items');
      }

      return order as Order;
    },
    onSuccess: (order) => {
      toast.success(`Order ${order.order_number} placed successfully!`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
};

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

      return data as Order[];
    },
    enabled: !!userId,
  });
};

// Get order by order number (for tracking)
export const useOrderByNumber = (orderNumber: string) => {
  return useQuery({
    queryKey: ['orders', 'number', orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      return data as Order | null;
    },
    enabled: !!orderNumber,
  });
};

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
