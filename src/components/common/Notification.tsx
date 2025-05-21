import { toast } from 'react-toastify';

export default function notification(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    options?: { autoClose?: number }
) {
    return toast[type](message, {
        position: 'bottom-right',
        autoClose: options?.autoClose ?? 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
}

