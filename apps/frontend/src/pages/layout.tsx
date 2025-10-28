export default function RootLaout({ children }: { children: React.ReactNode }) {
    return (
        <div id="root-layout" className="flex min-h-svh flex-col items-center justify-center">
            <h1 className="mb-6 text-3xl font-bold text-blue-600">Tuition ERP MVP</h1>
            {children}
        </div>
    );
}
