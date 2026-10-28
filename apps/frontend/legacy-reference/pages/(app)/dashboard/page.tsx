'use client';

import { DollarSign, Users, BookMarked } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import {
    useGetDashboardStatsQuery,
    useGetRecentActivityQuery,
} from '@/features/dashboard/dashboard-api-slice';
import { formatCurrency, formatDate } from '@/lib/utils';

// --- Stat Card Component ---
const StatCard = ({
    title,
    value,
    icon: Icon,
    isLoading,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    isLoading: boolean;
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);

// --- Main Dashboard Component ---
export default function DashboardPage() {
    const user = useAppSelector(selectCurrentUser);
    const { data: stats, isLoading: isLoadingStats } = useGetDashboardStatsQuery();
    const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivityQuery();

    return (
        <div className="flex flex-col gap-8">
            {/* --- Header --- */}
            <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.first_name}!
                </h1>
                <p className="text-muted-foreground">
                    Here's a high-level overview of your institution.
                </p>
            </div>

            {/* --- Stat Cards --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={stats?.totalStudents ?? 0}
                    icon={Users}
                    isLoading={isLoadingStats}
                />
                <StatCard
                    title="Active Batches"
                    value={stats?.activeBatches ?? 0}
                    icon={BookMarked}
                    isLoading={isLoadingStats}
                />
                {/* --- Admin-Only Card --- */}
                {/* This card only renders if the 'totalRevenue' field exists in the API response */}
                {stats?.totalRevenue !== undefined && (
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                        isLoading={isLoadingStats}
                    />
                )}
            </div>

            {/* --- Recent Activity --- */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                        <CardDescription>The last 5 payments received.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingActivity ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activity?.recentPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.student.first_name}{' '}
                                                {payment.student.last_name}
                                            </TableCell>
                                            <TableCell>
                                                {payment.batch.name} ({payment.batch.subject})
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enrollments</CardTitle>
                        <CardDescription>The last 5 students enrolled.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingActivity ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activity?.recentEnrollments.map((e) => (
                                        <TableRow key={e.id}>
                                            <TableCell>
                                                {e.student.first_name} {e.student.last_name}
                                            </TableCell>
                                            <TableCell>
                                                {e.batch.name} ({e.batch.subject})
                                            </TableCell>
                                            <TableCell>{formatDate(e.join_date)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
