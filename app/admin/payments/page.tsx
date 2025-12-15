'use client';

import { ShellMain, ShellContainer } from '@/components/layout/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminPaymentsPage() {
  // Placeholder data - would be fetched from API
  const payments = [
    {
      id: '1',
      userId: 'user-123',
      userEmail: 'agent1@example.com',
      amount: 79.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'stripe',
      transactionId: 'pi_1234567890',
      description: 'Professional Plan - Monthly',
      createdAt: '2024-12-15T10:30:00Z',
    },
    {
      id: '2',
      userId: 'user-456',
      userEmail: 'agent2@example.com',
      amount: 199.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'stripe',
      transactionId: 'pi_0987654321',
      description: 'Premium Plan - Monthly',
      createdAt: '2024-12-14T15:20:00Z',
    },
    {
      id: '3',
      userId: 'user-789',
      userEmail: 'agent3@example.com',
      amount: 29.99,
      currency: 'USD',
      status: 'FAILED',
      paymentMethod: 'stripe',
      transactionId: 'pi_5555666677',
      description: 'Starter Plan - Monthly',
      createdAt: '2024-12-13T08:45:00Z',
    },
  ];

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    REFUNDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };

  return (
    <ShellMain>
      <ShellContainer className="py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payment Management
          </h1>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,459.87</div>
              <p className="text-xs text-slate-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-slate-600">Total transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-slate-600">Payment conversion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-slate-600">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      User
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {payment.transactionId}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {payment.userEmail}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {payment.userId}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[payment.status]}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ShellContainer>
    </ShellMain>
  );
}
