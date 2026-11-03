import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
    InstitutionGroupResponse,
    InstitutionStaffInvitationResponse,
    InstitutionStaffMembershipResponse,
} from '@erp/shared';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';
import { DataTableSearch } from '@/components/shared/data-table/data-table-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
import { Grid } from '@/components/ui/grid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { formatDate } from '@/lib/utils/formatters';
import { InvitationCard, TeamMemberCard } from './team-cards';

export function TeamMembersDataTable({
    members,
    groups,
    onStatus,
}: {
    members: InstitutionStaffMembershipResponse[];
    groups: InstitutionGroupResponse[];
    onStatus: (message: string) => void;
}) {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const selectedMember = members.find((member) => member.account_id === selectedMemberId);
    const columns = useMemo<ColumnDef<InstitutionStaffMembershipResponse, unknown>[]>(
        () => [
            {
                accessorKey: 'email',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            },
            {
                id: 'status',
                accessorFn: (member) => (member.revoked_at ? 'Revoked' : 'Active Staff'),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) => (
                    <Badge variant={row.original.revoked_at ? 'destructive' : 'secondary'}>
                        {row.original.revoked_at ? 'Revoked' : 'Active Staff'}
                    </Badge>
                ),
            },
            {
                id: 'groups',
                accessorFn: (member) =>
                    groups
                        .filter((group) => member.group_ids.includes(group.id))
                        .map((group) => group.name)
                        .join(', '),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Groups" />,
                cell: ({ row }) => {
                    const names = groups
                        .filter((group) => row.original.group_ids.includes(group.id))
                        .map((group) => group.name);
                    return names.join(', ') || 'No groups assigned';
                },
            },
            {
                id: 'actions',
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => {
                    const isSelected = selectedMemberId === row.original.account_id;
                    return (
                        <Button
                            type="button"
                            variant="outline"
                            aria-expanded={isSelected}
                            aria-controls="team-member-details"
                            onClick={() =>
                                setSelectedMemberId(isSelected ? null : row.original.account_id)
                            }
                        >
                            {isSelected ? 'Close details' : 'Manage Staff'}
                        </Button>
                    );
                },
            },
        ],
        [groups, selectedMemberId]
    );

    return (
        <div className="space-y-4">
            <DataTable
                ariaLabel="Institution Staff members"
                columns={columns}
                data={members}
                toolbar={(table) => (
                    <Grid
                        id="team-members-data-table-filters"
                        columns={1}
                        className="gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]"
                    >
                        <FlexItem id="team-members-data-table-search" className="min-w-0">
                            <DataTableSearch
                                table={table}
                                label="Search Staff members"
                                placeholder="Search email, status, or group"
                            />
                        </FlexItem>
                        <FlexItem id="team-members-data-table-status-filter">
                            <Select
                                value={String(table.getColumn('status')?.getFilterValue() ?? 'all')}
                                onValueChange={(value) =>
                                    table
                                        .getColumn('status')
                                        ?.setFilterValue(value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-label="Filter Staff by status"
                                >
                                    <SelectValue placeholder="All Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    <SelectItem value="Active Staff">Active Staff</SelectItem>
                                    <SelectItem value="Revoked">Revoked</SelectItem>
                                </SelectContent>
                            </Select>
                        </FlexItem>
                    </Grid>
                )}
                renderMobileRow={(row) => (
                    <TeamMemberCard
                        member={row.original}
                        groups={groups}
                        onStatus={onStatus}
                        idScope="mobile"
                    />
                )}
            />
            <div id="team-member-details" hidden={!selectedMember} className="space-y-3">
                {selectedMember && (
                    <>
                        <Flex
                            id="team-member-details-heading"
                            alignItems="center"
                            justifyContent="between"
                            wrap
                            className="gap-2"
                        >
                            <Typography as="h3" variant="large">
                                Manage {selectedMember.email}
                            </Typography>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedMemberId(null)}
                            >
                                Close details
                            </Button>
                        </Flex>
                        <TeamMemberCard
                            member={selectedMember}
                            groups={groups}
                            onStatus={onStatus}
                            idScope="desktop"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export function TeamInvitationsDataTable({
    invitations,
    groups,
    onReplace,
    onStatus,
}: {
    invitations: InstitutionStaffInvitationResponse[];
    groups: InstitutionGroupResponse[];
    onReplace: (invitation: InstitutionStaffInvitationResponse) => void;
    onStatus: (message: string) => void;
}) {
    const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
    const selectedInvitation = invitations.find(
        (invitation) => invitation.id === selectedInvitationId
    );
    const columns = useMemo<ColumnDef<InstitutionStaffInvitationResponse, unknown>[]>(
        () => [
            {
                accessorKey: 'invited_email',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            },
            {
                accessorKey: 'status',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) => (
                    <Badge variant={row.original.status === 'PENDING' ? 'secondary' : 'outline'}>
                        {row.original.status.charAt(0) + row.original.status.slice(1).toLowerCase()}
                    </Badge>
                ),
            },
            {
                accessorKey: 'expires_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
                cell: ({ row }) => formatDate(new Date(row.original.expires_at), 'PPP p'),
            },
            {
                id: 'groups',
                accessorFn: (invitation) =>
                    groups
                        .filter((group) => invitation.group_ids.includes(group.id))
                        .map((group) => group.name)
                        .join(', '),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Groups" />,
                cell: ({ row }) => {
                    const names = groups
                        .filter((group) => row.original.group_ids.includes(group.id))
                        .map((group) => group.name);
                    return names.join(', ') || 'No groups selected';
                },
            },
            {
                id: 'actions',
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => {
                    const isSelected = selectedInvitationId === row.original.id;
                    return (
                        <Button
                            type="button"
                            variant="outline"
                            aria-expanded={isSelected}
                            aria-controls="team-invitation-details"
                            onClick={() =>
                                setSelectedInvitationId(isSelected ? null : row.original.id)
                            }
                        >
                            {isSelected ? 'Close details' : 'Manage invitation'}
                        </Button>
                    );
                },
            },
        ],
        [groups, selectedInvitationId]
    );

    return (
        <div className="space-y-4">
            <DataTable
                ariaLabel="Institution Staff invitations"
                columns={columns}
                data={invitations}
                toolbar={(table) => (
                    <Grid
                        id="team-invitations-data-table-filters"
                        columns={1}
                        className="gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]"
                    >
                        <FlexItem id="team-invitations-data-table-search" className="min-w-0">
                            <DataTableSearch
                                table={table}
                                label="Search Staff invitations"
                                placeholder="Search email, status, or group"
                            />
                        </FlexItem>
                        <FlexItem id="team-invitations-data-table-status-filter">
                            <Select
                                value={String(table.getColumn('status')?.getFilterValue() ?? 'all')}
                                onValueChange={(value) =>
                                    table
                                        .getColumn('status')
                                        ?.setFilterValue(value === 'all' ? undefined : value)
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    aria-label="Filter invitations by status"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="EXPIRED">Expired</SelectItem>
                                    <SelectItem value="REVOKED">Revoked</SelectItem>
                                </SelectContent>
                            </Select>
                        </FlexItem>
                    </Grid>
                )}
                renderMobileRow={(row) => (
                    <InvitationCard
                        invitation={row.original}
                        groups={groups}
                        onReplace={onReplace}
                        onStatus={onStatus}
                    />
                )}
            />
            <div id="team-invitation-details" hidden={!selectedInvitation} className="space-y-3">
                {selectedInvitation && (
                    <>
                        <Flex
                            id="team-invitation-details-heading"
                            alignItems="center"
                            justifyContent="between"
                            wrap
                            className="gap-2"
                        >
                            <Typography as="h3" variant="large">
                                Manage invitation for {selectedInvitation.invited_email}
                            </Typography>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedInvitationId(null)}
                            >
                                Close details
                            </Button>
                        </Flex>
                        <InvitationCard
                            invitation={selectedInvitation}
                            groups={groups}
                            onReplace={onReplace}
                            onStatus={onStatus}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
