/**
 * Admin Read Items Hook
 * 
 * Tracks which items (orders, messages, returns) an admin has viewed.
 * Uses Supabase as the single source of truth - no localStorage.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type ItemType = 'order' | 'message' | 'return';

interface AdminReadItem {
  id: string;
  admin_id: string;
  item_type: ItemType;
  item_id: string;
  read_at: string;
}

/**
 * Hook to manage admin read status for items
 */
export const useAdminReadItems = (itemType: ItemType) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all read items for this admin and item type
  const { data: readItems = [], isLoading } = useQuery({
    queryKey: ['admin-read-items', itemType, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('admin_read_items')
        .select('item_id')
        .eq('admin_id', user.id)
        .eq('item_type', itemType);

      if (error) {
        console.error('Error fetching read items:', error);
        return [];
      }

      return data.map((item) => item.item_id);
    },
    enabled: !!user?.id,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Mark item as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase.from('admin_read_items').upsert(
        {
          admin_id: user.id,
          item_type: itemType,
          item_id: itemId,
          read_at: new Date().toISOString(),
        },
        {
          onConflict: 'admin_id,item_type,item_id',
        }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-read-items', itemType, user?.id] });
    },
  });

  // Check if an item has been read
  const isRead = (itemId: string): boolean => {
    return readItems.includes(itemId);
  };

  // Mark an item as read
  const markAsRead = (itemId: string) => {
    if (!isRead(itemId)) {
      markAsReadMutation.mutate(itemId);
    }
  };

  // Calculate unread count from a list of items
  const getUnreadCount = (items: { id: string }[]): number => {
    return items.filter((item) => !readItems.includes(item.id)).length;
  };

  return {
    readItems,
    isLoading,
    isRead,
    markAsRead,
    getUnreadCount,
  };
};

/**
 * Hook to get all unread counts for the sidebar
 */
export const useAdminUnreadCounts = () => {
  const { user } = useAuth();

  // Fetch all read items at once for efficiency
  const { data: allReadItems = [] } = useQuery({
    queryKey: ['admin-read-items', 'all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('admin_read_items')
        .select('item_type, item_id')
        .eq('admin_id', user.id);

      if (error) {
        console.error('Error fetching all read items:', error);
        return [];
      }

      return data as { item_type: ItemType; item_id: string }[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Fetch recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ['admin', 'orders', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent messages
  const { data: recentMessages = [] } = useQuery({
    queryKey: ['admin', 'messages', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent return requests
  const { data: recentReturns = [] } = useQuery({
    queryKey: ['admin', 'returns', 'recent-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_requests')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    },
  });

  // Calculate counts
  const readOrderIds = allReadItems.filter((i) => i.item_type === 'order').map((i) => i.item_id);
  const readMessageIds = allReadItems.filter((i) => i.item_type === 'message').map((i) => i.item_id);
  const readReturnIds = allReadItems.filter((i) => i.item_type === 'return').map((i) => i.item_id);

  return {
    orders: recentOrders.filter((o) => !readOrderIds.includes(o.id)).length,
    messages: recentMessages.filter((m) => !readMessageIds.includes(m.id)).length,
    returns: recentReturns.filter((r) => !readReturnIds.includes(r.id)).length,
  };
};
