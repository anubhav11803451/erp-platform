import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/root-reducer';
import { createAppSlice } from './create-app-slice';
import type { EnrichedPayment } from '@erp/shared';

// Define the state for the "Add Payment" modal
type PaymentFormModalState = {
    isOpen: boolean;
    studentId: string | null;
    batchId?: string | null;
    paymentToEdit?: EnrichedPayment | null;
};

type UIState = {
    paymentFormModal: PaymentFormModalState;
    // We can add other modal states here later
    // e.g., editPaymentModal: { isOpen: false, paymentId: null }
};

const initialState: UIState = {
    paymentFormModal: {
        isOpen: false,
        studentId: null,
        batchId: null,
        paymentToEdit: null,
    },
};

const uiSlice = createAppSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Action to open the "Add Payment" modal
        openPaymentFormModal: (
            state,
            action: PayloadAction<{
                studentId: string;
                batchId?: string;
                paymentToEdit?: EnrichedPayment;
            }>
        ) => {
            state.paymentFormModal.studentId = action.payload.studentId;
            state.paymentFormModal.batchId = action.payload.batchId;
            state.paymentFormModal.paymentToEdit = action.payload.paymentToEdit;
            state.paymentFormModal.isOpen = true;
        },
        // Action to close the "Add Payment" modal
        closePaymentFormModal: (state) => {
            state.paymentFormModal.studentId = null;
            state.paymentFormModal.paymentToEdit = null;
            state.paymentFormModal.batchId = null;
            state.paymentFormModal.isOpen = false;
        },
    },
});

export const { openPaymentFormModal, closePaymentFormModal } = uiSlice.actions;

// --- Selectors ---
export const selectPaymentFormModal = (state: RootState) => state.ui.paymentFormModal;

export default uiSlice;
