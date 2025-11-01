import { useParams } from 'react-router';

export default function BlogPost() {
    const { slug } = useParams();

    return (
        <h1>
            Post: {slug}
            <br />
        </h1>
    );
}
