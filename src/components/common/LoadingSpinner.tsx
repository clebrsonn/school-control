import Spinner from 'react-bootstrap/Spinner';

export const LoadingSpinner: React.FC = () => (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <Spinner animation="border" variant="primary" />
    </div>
);
