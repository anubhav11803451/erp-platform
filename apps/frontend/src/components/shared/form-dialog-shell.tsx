import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type FormDialogShellProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
};

export function FormDialogShell({
    isOpen,
    setIsOpen,
    title,
    description,
    children,
    className,
}: FormDialogShellProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className={className || 'sm:max-w-3xl'}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
