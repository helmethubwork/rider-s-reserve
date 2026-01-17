/**
 * Admin Messages
 * 
 * View and manage contact form submissions from users.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Eye, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
}

const AdminMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();

  // Fetch all contact messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin', 'contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] });
      toast.success('Message deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete message');
    },
  });

  const handleDelete = (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(messageId);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600">View and manage messages from users</p>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">No messages yet</p>
              <p className="text-sm">Contact form submissions will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-100 border-b-2 border-gray-200">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">Name</TableHead>
                  <TableHead className="font-bold text-gray-700">Email</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-gray-700">Phone</TableHead>
                  <TableHead className="font-bold text-gray-700">Subject</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-gray-700">Date</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id} className="hover:bg-gray-50">
                    <TableCell className="font-bold text-gray-900">{msg.name}</TableCell>
                    <TableCell className="text-gray-700">{msg.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600">
                      {msg.phone || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-700">
                      {msg.subject}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-600">
                      {format(new Date(msg.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedMessage(msg)}
                          title="View message"
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Eye size={18} className="text-gray-700" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(msg.id)}
                          disabled={deleteMutation.isPending}
                          title="Delete message"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">{selectedMessage?.subject}</DialogTitle>
              <DialogDescription className="text-gray-600">
                From {selectedMessage?.name} on{' '}
                {selectedMessage?.created_at &&
                  format(new Date(selectedMessage.created_at), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="font-bold text-gray-900">{selectedMessage?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="font-bold text-gray-900">{selectedMessage?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm mb-2">Message</p>
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <p className="whitespace-pre-wrap text-gray-900">{selectedMessage?.message}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
