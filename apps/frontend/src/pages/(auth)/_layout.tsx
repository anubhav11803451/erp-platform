import { ModeToggle } from '@/components/theme-toggle';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
// import { Typography } from '@/components/ui/typography';
import { Outlet } from 'react-router';

export default function AuthLayout() {
    return (
        <Container fullScreen>
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                fullHeight
                className="p-4"
            >
                <FlexItem className="absolute top-4 right-4">
                    <ModeToggle />
                </FlexItem>
                <Outlet />
            </Flex>
        </Container>
    );
}
