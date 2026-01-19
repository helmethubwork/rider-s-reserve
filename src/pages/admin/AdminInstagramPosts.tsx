/**
 * Admin Instagram Posts Page
 * 
 * View Instagram reel IDs displayed on the homepage feed.
 * The reels are configured in src/data/instagramReels.ts
 * To change reels, update that file directly via chat.
 */

import AdminLayout from './AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Instagram, ExternalLink, Info } from 'lucide-react';
import { instagramReelIds } from '@/data/instagramReels';

const AdminInstagramPosts = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instagram Feed</h1>
          <p className="text-gray-600">View Instagram reels displayed on the homepage</p>
        </div>

        {/* Info Card - How to edit */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">How to update reels</p>
              <p className="text-gray-600">
                To add, remove, or reorder Instagram reels, ask me in the chat! Just say something like:
                <br />
                <span className="italic">"Add this Instagram reel: ABC123xyz"</span> or <span className="italic">"Remove the first Instagram reel"</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Card - How to get Reel ID */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Instagram className="h-5 w-5 text-pink-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">How to get Reel ID</p>
              <p className="text-gray-600">
                Open the Instagram reel → Click share → Copy link → The ID is the code after "/reel/" in the URL.
                <br />
                Example: instagram.com/reel/<strong className="text-pink-600">C-C3abzBKYd</strong>/ → ID is <strong className="text-pink-600">C-C3abzBKYd</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100 border-b-2 border-gray-200">
              <TableRow>
                <TableHead className="w-16 font-bold text-gray-700">#</TableHead>
                <TableHead className="font-bold text-gray-700">Reel ID</TableHead>
                <TableHead className="font-bold text-gray-700">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instagramReelIds.map((reelId, index) => (
                <TableRow key={reelId} className="hover:bg-gray-50">
                  <TableCell className="font-bold text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-gray-900">
                    {reelId}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://www.instagram.com/reel/${reelId}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Instagram
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Current count */}
        <p className="text-sm text-gray-500 text-center">
          {instagramReelIds.length} reel{instagramReelIds.length !== 1 ? 's' : ''} configured
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminInstagramPosts;
