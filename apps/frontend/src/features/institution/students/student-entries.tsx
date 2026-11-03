import { Archive, Pencil, Save, UserPlus, X } from 'lucide-react';
import { z } from 'zod/v4';
import {
    institutionStudentCreateRequestSchema,
    institutionStudentGroupMembershipUpdateRequestSchema,
    type InstitutionGroupResponse,
    type InstitutionStudentResponse,
} from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckboxGroupField } from '@/features/institution/shared/checkbox-group-field';
import {
    useInstitutionStudentActions,
    useInstitutionStudentCreate,
} from '@/hooks/institution/students/use-institution-student-actions';

const studentCreateFormSchema = z.object({
    display_name: institutionStudentCreateRequestSchema.shape.display_name,
    local_id: z.string().trim().max(64),
    group_ids: institutionStudentCreateRequestSchema.shape.group_ids,
});

const studentDetailsFormSchema = z.object({
    display_name: institutionStudentCreateRequestSchema.shape.display_name,
    local_id: z.string().trim().max(64),
});

export function StudentCreateForm({
    groups,
    onStatus,
}: {
    groups: InstitutionGroupResponse[];
    onStatus: (message: string) => void;
}) {
    const { submit, error, createState, formVersion } = useInstitutionStudentCreate(onStatus);

    return (
        <SmartForm
            key={formVersion}
            id="student-create-form"
            schema={studentCreateFormSchema}
            defaultValues={{ display_name: '', local_id: '', group_ids: [] }}
            onSubmit={submit}
            noValidate
            showSubmitButton={false}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    name="display_name"
                    idPrefix="new-student"
                    label="Display name"
                    description="Required. This name is shown to assigned Staff."
                    required
                    disabled={createState.isLoading}
                />
                <TextField
                    name="local_id"
                    idPrefix="new-student"
                    label="Local ID (optional)"
                    description="Must be unique within this Institution; archived IDs remain reserved."
                    disabled={createState.isLoading}
                />
            </div>
            <CheckboxGroupField
                name="group_ids"
                idPrefix="new-student-group"
                label="Assign groups (optional)"
                options={groups.map((group) => ({ value: group.id, label: group.name }))}
                emptyMessage="Create a group before assigning students."
                disabled={createState.isLoading}
            />
            {error && (
                <Alert variant="destructive" aria-live="assertive">
                    <AlertTitle>Student could not be added</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" form="student-create-form" disabled={createState.isLoading}>
                <UserPlus aria-hidden="true" />
                {createState.isLoading ? 'Adding…' : 'Add student'}
            </Button>
        </SmartForm>
    );
}

export function StudentCard({
    student,
    groups,
    staff,
    onStatus,
    idScope = 'student',
}: {
    student: InstitutionStudentResponse;
    groups: InstitutionGroupResponse[];
    staff: boolean;
    onStatus: (message: string) => void;
    idScope?: string;
}) {
    const {
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
    } = useInstitutionStudentActions({ student, staff, groups, onStatus });
    const controlPrefix = `${idScope}-${student.id}`;
    const errorId = `student-update-error-${controlPrefix}`;
    const detailsFormId = `student-details-${controlPrefix}`;
    const groupsFormId = `student-groups-${controlPrefix}`;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="break-words">{student.display_name}</CardTitle>
                        <CardDescription>
                            {student.local_id ? `Local ID: ${student.local_id}` : 'No local ID'}
                        </CardDescription>
                    </div>
                    <Badge variant="outline">
                        {currentGroupNames.length
                            ? `${currentGroupNames.length} ${
                                  currentGroupNames.length === 1 ? 'group' : 'groups'
                              }`
                            : 'No group'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                    {currentGroupNames.length
                        ? currentGroupNames.join(', ')
                        : 'No current group assigned.'}
                </p>
                {message && (
                    <Alert id={errorId} variant="destructive" aria-live="assertive">
                        <AlertTitle>Student update failed</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
                {editing ? (
                    <SmartForm
                        key={`${controlPrefix}-${student.updated_at}`}
                        id={detailsFormId}
                        schema={studentDetailsFormSchema}
                        defaultValues={{
                            display_name: student.display_name,
                            local_id: student.local_id ?? '',
                        }}
                        onSubmit={saveDetails}
                        noValidate
                        showSubmitButton={false}
                    >
                        {(form) => (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <TextField
                                        name="display_name"
                                        idPrefix={controlPrefix}
                                        label="Display name"
                                        description="Required."
                                        required
                                        disabled={busy}
                                    />
                                    <TextField
                                        name="local_id"
                                        idPrefix={controlPrefix}
                                        label="Local ID (optional)"
                                        description="Local IDs are unique within the Institution."
                                        disabled={busy}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="submit"
                                        form={detailsFormId}
                                        disabled={busy || !form.formState.isDirty}
                                    >
                                        <Save aria-hidden="true" />
                                        {updateState.isLoading ? 'Saving…' : 'Save student'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={() => {
                                            setEditing(false);
                                            setMessage(null);
                                        }}
                                    >
                                        <X aria-hidden="true" />
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </SmartForm>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => setEditing(true)}
                    >
                        <Pencil aria-hidden="true" />
                        Edit student
                    </Button>
                )}
                {!staff && (
                    <SmartForm
                        key={`${controlPrefix}-groups-${student.group_ids.join(',')}`}
                        id={groupsFormId}
                        schema={institutionStudentGroupMembershipUpdateRequestSchema}
                        defaultValues={{ group_ids: student.group_ids }}
                        onSubmit={saveMembership}
                        noValidate
                        showSubmitButton={false}
                        className="space-y-2 border-t pt-4"
                    >
                        {(form) => {
                            const groupIds = form.watch('group_ids');
                            const unchangedGroups =
                                groupIds.length === student.group_ids.length &&
                                groupIds.every((id) => student.group_ids.includes(id));
                            return (
                                <>
                                    <CheckboxGroupField
                                        name="group_ids"
                                        idPrefix={`${controlPrefix}-group`}
                                        label="Group membership"
                                        options={groups.map((group) => ({
                                            value: group.id,
                                            label: group.name,
                                        }))}
                                        emptyMessage="Create a group before assigning students."
                                        disabled={busy}
                                    />
                                    <Button
                                        type="submit"
                                        form={groupsFormId}
                                        variant="outline"
                                        disabled={busy || unchangedGroups}
                                    >
                                        <Save aria-hidden="true" />
                                        {groupState.isLoading
                                            ? 'Saving groups…'
                                            : 'Save group membership'}
                                    </Button>
                                </>
                            );
                        }}
                    </SmartForm>
                )}
                {!staff && (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => setArchiveOpen(true)}
                        >
                            <Archive aria-hidden="true" />
                            Archive student
                        </Button>
                        <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Archive {student.display_name}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The student will leave active roster operations. Saved
                                        attendance history and the reserved local ID are retained.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row">
                                    <AlertDialogCancel disabled={archiveState.isLoading}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={archiveState.isLoading}
                                        onClick={() => void archive()}
                                    >
                                        {archiveState.isLoading ? 'Archiving…' : 'Archive student'}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
