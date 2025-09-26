// src/pages/BulkOrdersPage.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import axios, {type AxiosInstance } from 'axios';
import clsx from 'clsx';
import { BASE_URL } from '../../utils/constants';
import { useAppSelector } from '../../reducers/store';

type BulkOrderProduct = {
  quantity: number;
  buyingValue: number;
  sellingValue: number;
  farmerOrders: string[];
  product: {
    _id: string;
    category: string;
    subCategory: string;
    buyingPrice: number;
    sellingPrice: number;
    stock: number;
    isActive: boolean;
    createdBy: string;
    createdByRole: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

type Address = {
  state?: string;
  district?: string;
  tehsil?: string;
  block?: string;
  village?: string;
  pincode?: string;
};

type CreatedBy = {
  _id: string;
  name: string;
  mobile: string;
  address?: Address;
};

type BulkOrder = {
  _id: string;
  createdBy: CreatedBy;
  type: string;
  products: BulkOrderProduct[];
  totalBuyingValue: number;
  totalSellingValue: number;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'approverd' | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Pagination = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
};

type BulkOrdersResponse = {
  status_code: number;
  data: {
    pagination: Pagination;
    bulkOrders: BulkOrder[];
  };
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
] as const;

type TabKey = typeof TABS[number]['key'];

// Normalize API statuses: map "approverd" and "draft" into UI buckets
function normalizeStatus(s: string): 'pending' | 'approved' | 'rejected' | 'other' {
  const v = (s || '').toLowerCase().trim();
  if (v === 'approved') return 'approved';
  if (v === 'rejected') return 'rejected';
  if (v === 'pending') return 'pending';
  // Treat known inconsistencies as pending draft queue
  if (v === 'approverd' || v === 'draft') return 'pending';
  return 'other';
}

function formatINR(n: number | undefined) {
  if (typeof n !== 'number') return '-';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function useAxios(baseURL: string) {
  const instance = useMemo<AxiosInstance>(() => {
    const inst = axios.create({ baseURL });
    return inst;
  }, [baseURL]);

  // Attach token if provided on per-call basis via headers override
  return instance;
}

export default function BulkOrdersPage() {
    const { token } = useAppSelector((state) => state.auth);
  // Tokens: wire these from auth context or props as needed
  const POS_TOKEN = token;      // read from secure storage
  const ADMIN_TOKEN = token;  // read from secure storage

  const api = useAxios(BASE_URL);

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(4);

  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<BulkOrdersResponse>(
        '/api/bulkOrder',
        { page, limit },
        { headers: { Authorization: `Bearer ${POS_TOKEN}` } }
      );
      const payload = res.data?.data;
      setOrders(payload?.bulkOrders ?? []);
      setPagination(payload?.pagination ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [api, page, limit, POS_TOKEN]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter on client since list is small; if large, add server-side status filter param
  const filtered = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => normalizeStatus(o.status) === activeTab);
  }, [orders, activeTab]);

  const onApproveReject = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(orderId);
      await api.patch(
        '/api/bulkOrder/update-status',
        { orderId, status },
        { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }
      );
      // Refresh current page
      await fetchOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const canGoPrev = pagination ? pagination.currentPage > 1 : false;
  const canGoNext = pagination ? pagination.currentPage < pagination.totalPages : false;

  return (
    <div className="mx-auto max-w-7xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h1 className="text-lg sm:text-xl font-semibold">Bulk Orders</h1>
        {pagination && (
          <div className="text-xs sm:text-sm text-gray-500">
            Page {pagination.currentPage} / {pagination.totalPages} • {pagination.totalItems} items
          </div>
        )}
      </div>

      {/* Tabs - mobile scrollable */}
      <div className="w-full overflow-x-auto">
        <div className="inline-flex min-w-full gap-1 sm:gap-2">
          {TABS.map(tab => {
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-3 py-2 text-sm whitespace-nowrap rounded-md border transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  selected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                )}
                aria-selected={selected}
                role="tab"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loader / Error */}
      {loading && (
        <div className="mt-4 text-sm text-gray-600">Loading orders...</div>
      )}
      {error && !loading && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}

      {/* List */}
      {!loading && filtered.length === 0 && (
        <div className="mt-6 text-sm text-gray-500">No orders to display.</div>
      )}

      <ul className="mt-3 grid grid-cols-1 gap-3 sm:gap-4">
        {filtered.map(order => {
          const nStatus = normalizeStatus(order.status);
          const canModerate = nStatus === 'pending';
          return (
            <li
              key={order._id}
              className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    Order #{order._id.slice(-6)}
                  </div>
                  <div className="text-xs text-gray-600">
                    By {order.createdBy?.name} • {order.createdBy?.mobile}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      nStatus === 'approved' && 'bg-green-100 text-green-700',
                      nStatus === 'rejected' && 'bg-rose-100 text-rose-700',
                      nStatus === 'pending' && 'bg-amber-100 text-amber-800',
                      nStatus === 'other' && 'bg-gray-100 text-gray-700'
                    )}
                    title={order.status}
                  >
                    {nStatus.charAt(0).toUpperCase() + nStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium text-gray-900">{order.type}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-gray-500">Items</div>
                  <div className="font-medium text-gray-900">{order.products?.length ?? 0}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-gray-500">Buy Value</div>
                  <div className="font-medium text-gray-900">{formatINR(order.totalBuyingValue)}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <div className="text-gray-500">Sell Value</div>
                  <div className="font-medium text-gray-900">{formatINR(order.totalSellingValue)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {canModerate ? (
                  <>
                    <button
                      onClick={() => onApproveReject(order._id, 'approved')}
                      className={clsx(
                        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium',
                        'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
                      )}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => onApproveReject(order._id, 'rejected')}
                      className={clsx(
                        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium',
                        'bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500'
                      )}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-gray-500">No actions available</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => canGoPrev && setPage(p => Math.max(1, p - 1))}
          disabled={!canGoPrev}
          className={clsx(
            'rounded-md border px-3 py-2 text-sm',
            canGoPrev ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Previous
        </button>
        <button
          onClick={() => canGoNext && setPage(p => p + 1)}
          disabled={!canGoNext}
          className={clsx(
            'rounded-md border px-3 py-2 text-sm',
            canGoNext ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
