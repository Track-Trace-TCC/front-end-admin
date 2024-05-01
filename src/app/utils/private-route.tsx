import { useEffect, useState, FC } from 'react';

type ComponentTypeWithProps = React.ComponentType<any>;

const PrivateRoute = (Page: ComponentTypeWithProps) => {
    const WrappedPage: FC = (props) => {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/auth';
            } else {
                setIsLoading(false);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        }, []);

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        return <Page {...props} />;
    };

    return WrappedPage;
};

export default PrivateRoute;
