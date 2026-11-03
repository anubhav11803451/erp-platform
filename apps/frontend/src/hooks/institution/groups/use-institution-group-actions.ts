import { useState } from 'react';
import type { InstitutionGroupResponse, InstitutionGroupType } from '@erp/shared';
import { toast } from 'sonner';
import {
    useArchiveInstitutionGroupMutation,
    useCreateInstitutionGroupMutation,
    useUpdateInstitutionGroupMutation,
} from '@/features/institution/groups/groups-api-slice';

type GroupStatusHandler = (message: string) => void;

export function useInstitutionGroupEditor(
    group: InstitutionGroupResponse | undefined,
    onStatus?: GroupStatusHandler
) {
    const [createGroup, createState] = useCreateInstitutionGroupMutation();
    const [updateGroup, updateState] = useUpdateInstitutionGroupMutation();
    const [editing, setEditing] = useState(!group);
    const [message, setMessage] = useState<string | null>(null);
    const isBusy = createState.isLoading || updateState.isLoading;

    async function submit(values: { name: string; type: InstitutionGroupType }) {
        setMessage(null);
        onStatus?.('');

        try {
            if (group) {
                await updateGroup({ groupId: group.id, payload: values }).unwrap();
                setEditing(false);
                onStatus?.('Group updated.');
                toast.success('Group updated.');
            } else {
                await createGroup(values).unwrap();
                onStatus?.('Group created.');
                toast.success('Group created.');
            }
        } catch {
            setMessage('The group could not be saved. Check your connection and try again.');
        }
    }

    function cancel() {
        setMessage(null);
        setEditing(false);
    }

    return {
        editing,
        setEditing,
        isBusy,
        message,
        setMessage,
        submit,
        cancel,
    };
}

export function useInstitutionGroupArchive(
    group: InstitutionGroupResponse,
    onStatus: GroupStatusHandler
) {
    const [archiveGroup, archiveState] = useArchiveInstitutionGroupMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function archive() {
        setError(null);
        onStatus('');
        try {
            await archiveGroup({ groupId: group.id }).unwrap();
            setConfirmOpen(false);
            onStatus('Group archived. Its history is retained.');
            toast.success('Group archived. Its history is retained.');
        } catch {
            setConfirmOpen(false);
            setError('The group could not be archived. Refresh the list and try again.');
        }
    }

    return {
        archive,
        archiveState,
        confirmOpen,
        setConfirmOpen,
        error,
    };
}
