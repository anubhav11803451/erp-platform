import { ModeToggle } from '@/components/theme-toggle';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
import { Link } from 'react-router';

export default function Page() {
    return (
        <Container>
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

                <Link to="/posts/1">Post:1</Link>
                <br />
                <Link to="/posts/2">Post:2</Link>
                <br />
                <Link to="/posts/3">Post:3</Link>
            </Flex>
        </Container>
    );
}
