import { useMemo, useState } from 'react';
import {
    institutionProfileUpdateRequestSchema,
    type InstitutionProfileUpdateRequest,
} from '@erp/shared';
import { toast } from 'sonner';
import {
    useGetInstitutionProfileQuery,
    useUpdateInstitutionProfileMutation,
} from '@/features/institution/profile/profile-api-slice';

export function isValidInstitutionTimezone(value: string): boolean {
    try {
        new Intl.DateTimeFormat('en', { timeZone: value });
        return true;
    } catch {
        return false;
    }
}

export function useInstitutionProfile() {
    const profile = useGetInstitutionProfileQuery();
    const [updateProfile, updateState] = useUpdateInstitutionProfileMutation();
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const defaultValues = useMemo(
        () => ({
            name: profile.data?.name ?? '',
            timezone: profile.data?.timezone ?? '',
        }),
        [profile.data]
    );

    async function submit(values: InstitutionProfileUpdateRequest) {
        setFieldError(null);
        setStatusMessage('');
        const result = institutionProfileUpdateRequestSchema.safeParse(values);
        if (!result.success || !isValidInstitutionTimezone(result.data.timezone)) {
            setFieldError(
                'Enter a valid IANA timezone, for example Asia/Kolkata or America/Chicago.'
            );
            return;
        }

        try {
            await updateProfile(result.data).unwrap();
            setStatusMessage('Institution profile saved.');
            toast.success('Institution profile saved.');
        } catch {
            setFieldError('The profile could not be saved. Check your connection and try again.');
        }
    }

    return {
        profile,
        updateState,
        fieldError,
        statusMessage,
        defaultValues,
        submit,
    };
}
