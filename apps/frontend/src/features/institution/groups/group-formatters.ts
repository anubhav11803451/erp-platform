import type { InstitutionGroupType } from '@erp/shared';

export function formatGroupType(type: InstitutionGroupType): string {
    return type === 'SCHOOL_SECTION' ? 'School section' : 'Coaching batch';
}
