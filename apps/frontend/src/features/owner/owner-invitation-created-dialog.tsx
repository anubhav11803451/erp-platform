import { Check, Copy } from 'lucide-react';
import type { InstitutionAdminInvitationCreateResponse } from '@erp/shared';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils/formatters';

export function OwnerInvitationCreatedDialog({
    created,
    copyMessage,
    onCopy,
    onClose,
}: {
    created: InstitutionAdminInvitationCreateResponse | null;
    copyMessage: string;
    onCopy: () => Promise<void>;
    onClose: () => void;
}) {
    return (
        <Dialog open={Boolean(created)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Institution created — invitation link shown once</DialogTitle>
                    <DialogDescription>
                        {created?.institution.name} was added under its LegalEntity. Copy this link
                        and share it with {created?.invitation.invited_email}; closing removes the
                        link from this screen.
                    </DialogDescription>
                </DialogHeader>
                {created && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="one-time-invitation-link">
                                One-time invitation link
                            </Label>
                            <Input
                                id="one-time-invitation-link"
                                value={created.invitation.one_time_invitation_url}
                                readOnly
                                onFocus={(event) => event.currentTarget.select()}
                                className="min-h-11 font-mono text-xs"
                            />
                            <p className="text-muted-foreground text-sm">
                                It expires{' '}
                                {formatDate(new Date(created.invitation.expires_at), 'PPP p')}. The
                                link cannot be recovered from status after this dialog closes.
                            </p>
                        </div>
                        <p role="status" aria-live="polite" className="text-sm">
                            {copyMessage}
                        </p>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-11"
                                onClick={() => void onCopy()}
                            >
                                {copyMessage.startsWith('Invitation link copied') ? (
                                    <Check aria-hidden="true" />
                                ) : (
                                    <Copy aria-hidden="true" />
                                )}
                                Copy link
                            </Button>
                            <Button type="button" className="min-h-11" onClick={onClose}>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
