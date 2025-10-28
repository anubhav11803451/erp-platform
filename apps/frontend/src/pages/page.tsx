import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center">
            Page
            <Button>Click me</Button>
            <ModeToggle />
        </div>
    );
}
