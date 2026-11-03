import { useState } from 'react';
import {
    institutionStudentCreateRequestSchema,
    institutionStudentGroupMembershipUpdateRequestSchema,
    institutionStudentUpdateRequestSchema,
    type InstitutionGroupResponse,
    type InstitutionStudentResponse,
} from '@erp/shared';
import { toast } from 'sonner';
import {
    useArchiveInstitutionStudentMutation,
    useCreateInstitutionStudentMutation,
    useUpdateInstitutionStudentGroupsMutation,
    useUpdateInstitutionStudentMutation,
} from '@/features/institution/students/students-api-slice';

type StatusHandler = (message: string) => void;

export function useInstitutionStudentCreate(onStatus: StatusHandler) {
    const [createStudent, createState] = useCreateInstitutionStudentMutation();
    const [error, setError] = useState<string | null>(null);
    const [formVersion, setFormVersion] = useState(0);

    async function submit(values: { display_name: string; local_id: string; group_ids: string[] }) {
        setError(null);
        onStatus('');
        const parsed = institutionStudentCreateRequestSchema.safeParse({
            display_name: values.display_name,
            ...(values.local_id ? { local_id: values.local_id } : {}),
            group_ids: values.group_ids,
        });
        if (!parsed.success) {
            setError('Enter a student name and check the local ID and group selections.');
            return;
        }
        try {
            await createStudent(parsed.data).unwrap();
            setFormVersion((current) => current + 1);
            onStatus('Student added to the roster.');
            toast.success('Student added to the roster.');
        } catch {
            setError(
                'The student could not be added. Check for a duplicate local ID and try again.'
            );
        }
    }

    return { submit, error, createState, formVersion };
}

export function useInstitutionStudentActions({
    student,
    staff,
    groups,
    onStatus,
}: {
    student: InstitutionStudentResponse;
    staff: boolean;
    groups: InstitutionGroupResponse[];
    onStatus: StatusHandler;
}) {
    const [updateStudent, updateState] = useUpdateInstitutionStudentMutation();
    const [updateGroups, groupState] = useUpdateInstitutionStudentGroupsMutation();
    const [archiveStudent, archiveState] = useArchiveInstitutionStudentMutation();
    const [editing, setEditing] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const busy = updateState.isLoading || groupState.isLoading || archiveState.isLoading;
    const currentGroupNames = groups
        .filter((group) => student.group_ids.includes(group.id))
        .map((group) => group.name);

    async function saveDetails(values: { display_name: string; local_id: string }) {
        setMessage(null);
        onStatus('');
        const parsed = institutionStudentUpdateRequestSchema.safeParse({
            display_name: values.display_name,
            local_id: values.local_id.trim() || null,
        });
        if (!parsed.success) {
            setMessage('Change at least one field and enter a valid value.');
            return;
        }
        try {
            await updateStudent({
                studentId: student.id,
                payload: parsed.data,
                staff,
            }).unwrap();
            setEditing(false);
            onStatus('Student details saved.');
            toast.success('Student details saved.');
        } catch {
            setMessage('Student details could not be saved. Check the local ID and try again.');
        }
    }

    async function saveMembership(values: { group_ids: string[] }) {
        setMessage(null);
        onStatus('');
        const parsed = institutionStudentGroupMembershipUpdateRequestSchema.safeParse(values);
        if (!parsed.success) {
            setMessage('Group assignments could not be validated.');
            return;
        }
        try {
            await updateGroups({ studentId: student.id, groupIds: parsed.data.group_ids }).unwrap();
            onStatus('Student group membership saved.');
            toast.success('Student group membership saved.');
        } catch {
            setMessage('Group membership could not be updated. Refresh and try again.');
        }
    }

    async function archive() {
        setMessage(null);
        onStatus('');
        try {
            await archiveStudent({ studentId: student.id }).unwrap();
            setArchiveOpen(false);
            onStatus('Student archived. Attendance history is retained.');
            toast.success('Student archived. Attendance history is retained.');
        } catch {
            setArchiveOpen(false);
            setMessage('Student could not be archived. Refresh the roster and try again.');
        }
    }

    return {
        currentGroupNames,
        busy,
        editing,
        setEditing,
        archiveOpen,
        setArchiveOpen,
        message,
        setMessage,
        updateState,
        groupState,
        archiveState,
        saveDetails,
        saveMembership,
        archive,
    };
}
