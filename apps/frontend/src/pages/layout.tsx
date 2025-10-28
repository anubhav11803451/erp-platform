export default function RootLaout({ children }: { children: React.ReactNode }) {
    return (
        <div id="root-layout" className="flex min-h-svh flex-col items-center justify-center">
            {children}
        </div>
    );
}
