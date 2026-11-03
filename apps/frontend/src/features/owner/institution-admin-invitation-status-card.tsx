import type { ReactNode } from 'react';
import { CircleCheck, Clock, Copy, Mail, RefreshCw, X } from 'lucide-react';
import type { InstitutionAdminInvitationStatusResponse } from '@erp/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';

export type InstitutionAdminInvitationDetail = {
    label: string;
    value: string;
    monospace?: boolean;
};

export type InstitutionAdminInvitationStatusAction = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

type Props = {
    institutionId: string;
    institutionName: string;
    institutionCode: string | null;
    status: InstitutionAdminInvitationStatusResponse['status'] | undefined;
    isLoading: boolean;
    isFetching: boolean;
    statusUnavailable: boolean;
    notFound: boolean;
    statusAction?: InstitutionAdminInvitationStatusAction;
    summary?: string;
    details: InstitutionAdminInvitationDetail[];
    footerMessage?: string;
    codeCopyMessage: string;
    codeCopyFailed: boolean;
    onCopyInstitutionCode: () => void;
    onRefresh: () => void;
    children?: ReactNode;
};

function invitationStatusLabel(
    status: Props['status'],
    isLoading: boolean,
    statusUnavailable: boolean,
    notFound: boolean
): string {
    if (status === 'PENDING') return 'Claim Invited';
    if (status === 'PENDING_APPROVAL') return 'Review Pending Claim';
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'REVOKED') return 'Revoked';
    if (status === 'EXPIRED') return 'Expired';
    if (status === 'LEGACY_ACCEPTED') return 'Legacy Claim';
    if (isLoading) return 'Loading status';
    if (statusUnavailable) return 'Status unavailable';
    if (notFound) return 'Invitation not found';
    return 'Status unknown';
}

function invitationStatusTone(status: Props['status']): string {
    if (status === 'APPROVED') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }
    if (status === 'PENDING_APPROVAL') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 animate-pulse';
    }
    if (status === 'REJECTED') {
        return 'border-destructive/30 bg-destructive/10 text-destructive';
    }
    return 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400';
}

function InvitationStatusIcon({ status }: { status: Props['status'] }) {
    if (status === 'APPROVED') {
        return <CircleCheck aria-hidden="true" />;
    }
    if (status === 'PENDING_APPROVAL' || status === 'EXPIRED') {
        return <Clock aria-hidden="true" />;
    }
    if (status === 'PENDING') {
        return <Mail aria-hidden="true" />;
    }
    if (status === 'REJECTED' || status === 'REVOKED' || status === 'LEGACY_ACCEPTED') {
        return <X aria-hidden="true" />;
    }
    return null;
}

export function InstitutionAdminInvitationStatusCard({
    institutionId,
    institutionName,
    institutionCode,
    status,
    isLoading,
    isFetching,
    statusUnavailable,
    notFound,
    statusAction,
    summary,
    details,
    footerMessage,
    codeCopyMessage,
    codeCopyFailed,
    onCopyInstitutionCode,
    onRefresh,
    children,
}: Props) {
    const statusLabel = invitationStatusLabel(status, isLoading, statusUnavailable, notFound);

    return (
        <article className="bg-card space-y-3 rounded-lg border p-3 sm:p-4">
            <Flex
                id={`owner-invitation-header-${institutionId}`}
                alignItems="center"
                justifyContent="between"
                wrap
                className="gap-3"
            >
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Typography
                            as="h3"
                            variant="small"
                            weight="semibold"
                            className="wrap-break-word"
                        >
                            {institutionName}
                        </Typography>
                        <Badge variant="outline" className="font-mono">
                            {institutionCode ?? 'Code unavailable'}
                        </Badge>
                    </div>
                    <Typography as="p" variant="muted">
                        Role: Institution Admin
                    </Typography>
                </div>
                <Flex
                    id={`owner-invitation-actions-${institutionId}`}
                    alignItems="center"
                    className="gap-2"
                >
                    {statusAction ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full p-1"
                            aria-label={statusAction.label}
                            onClick={statusAction.onClick}
                            disabled={statusAction.disabled}
                        >
                            <Badge
                                variant="outline"
                                className={invitationStatusTone(status)}
                                aria-hidden="true"
                            >
                                <InvitationStatusIcon status={status} />
                                {statusAction.label}
                            </Badge>
                        </Button>
                    ) : (
                        <Badge
                            variant="outline"
                            className={invitationStatusTone(status)}
                            role="status"
                            aria-live="polite"
                        >
                            <InvitationStatusIcon status={status} />
                            {statusLabel}
                        </Badge>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={
                            institutionCode
                                ? `Copy Institution code ${institutionCode}`
                                : 'Institution code unavailable to copy'
                        }
                        onClick={onCopyInstitutionCode}
                        disabled={!institutionCode}
                    >
                        <Copy aria-hidden="true" />
                    </Button>
                </Flex>
            </Flex>

            {codeCopyMessage && (
                <Typography
                    as="p"
                    variant="muted"
                    role={codeCopyFailed ? 'alert' : 'status'}
                    aria-live={codeCopyFailed ? 'assertive' : 'polite'}
                    className={codeCopyFailed ? 'text-destructive' : undefined}
                >
                    {codeCopyMessage}
                </Typography>
            )}

            {isLoading ? (
                <Skeleton className="h-4 w-56" />
            ) : (
                summary && (
                    <Typography as="p" variant="muted" role="status">
                        {summary}
                    </Typography>
                )
            )}

            {details.length > 0 && (
                <Grid
                    as="dl"
                    id={`owner-invitation-details-${institutionId}`}
                    columns={1}
                    className="bg-background/60 gap-4 rounded-md border p-4 sm:grid-cols-2"
                >
                    {details.map(({ label, value, monospace }) => (
                        <div className="min-w-0" key={label}>
                            <dt className="text-muted-foreground text-sm">{label}</dt>
                            <dd
                                className={
                                    monospace
                                        ? 'mt-1 font-mono text-sm break-words'
                                        : 'mt-1 text-sm break-words'
                                }
                            >
                                {value}
                            </dd>
                        </div>
                    ))}
                </Grid>
            )}

            {children}

            <Flex
                as="footer"
                id={`owner-invitation-footer-${institutionId}`}
                alignItems="center"
                justifyContent="between"
                wrap
                className="gap-3"
            >
                {footerMessage ? (
                    <Typography as="p" variant="muted" className="min-w-0 flex-1">
                        {footerMessage}
                    </Typography>
                ) : (
                    <span aria-hidden="true" className="min-w-0 flex-1" />
                )}
                <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0"
                    onClick={onRefresh}
                    disabled={isFetching}
                >
                    <RefreshCw
                        aria-hidden="true"
                        className={isFetching ? 'animate-spin' : undefined}
                    />
                    {isFetching ? 'Refreshing…' : 'Refresh status'}
                </Button>
            </Flex>
        </article>
    );
}
