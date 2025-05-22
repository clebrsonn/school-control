import Spinner from 'react-bootstrap/Spinner';
import React from 'react'; // Import React for FC type

/**
 * @interface LoadingSpinnerProps
 * Props for the LoadingSpinner component.
 * Currently, this component does not accept any props directly influencing its appearance beyond styling,
 * but props could be added (e.g., for size, color, or a custom message).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoadingSpinnerProps {
    // Example potential prop:
    // message?: string; // Optional message to display alongside the spinner
}

/**
 * LoadingSpinner is a functional component that displays a centered Bootstrap spinner.
 * It's used to indicate a loading state in the application, typically covering the full viewport height.
 * This component currently does not display any text itself; any loading messages
 * should be handled by the parent component or context.
 *
 * @param {LoadingSpinnerProps} _props - The props for the component (currently unused).
 * @returns {React.ReactElement} A div containing the centered Bootstrap Spinner.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (_props: LoadingSpinnerProps) => (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <Spinner animation="border" variant="primary" />
        {/* If a message prop were added, it could be displayed here: */}
        {/* {_props.message && <span className="ms-2">{_props.message}</span>} */}
    </div>
);
