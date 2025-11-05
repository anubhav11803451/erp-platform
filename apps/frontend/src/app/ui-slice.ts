import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/root-reducer';
import { createAppSlice } from './create-app-slice';
import type { EnrichedPayment } from '@/features/payments/payments-api-slice';

// Define the state for the "Add Payment" modal
type PaymentFormModalState = {
    isOpen: boolean;
    studentId: string | null;
    batch?: { name?: string; value: string } | null;
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
        batch: null,
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
                batch?: { name?: string; value: string };
                paymentToEdit?: EnrichedPayment;
            }>
        ) => {
            state.paymentFormModal.isOpen = true;
            state.paymentFormModal.studentId = action.payload.studentId;
            state.paymentFormModal.batch = action.payload.batch;
            state.paymentFormModal.paymentToEdit = action.payload.paymentToEdit;
        },
        // Action to close the "Add Payment" modal
        closePaymentFormModal: (state) => {
            state.paymentFormModal.isOpen = false;
            state.paymentFormModal.studentId = null;
            state.paymentFormModal.paymentToEdit = null;
        },
    },
});

export const { openPaymentFormModal, closePaymentFormModal } = uiSlice.actions;

// --- Selectors ---
export const selectPaymentFormModal = (state: RootState) => state.ui.paymentFormModal;

export default uiSlice;
