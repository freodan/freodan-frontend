import { useEffect } from 'react';

export default function Index() {
    useEffect(() => {
        window.location.replace("feed");
    }, []);

    return (
        <div>Click <a href="feed">here</a> if you are not redirected.</div>
    )
}