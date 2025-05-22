import { toast, ToastOptions, TypeOptions } from 'react-toastify'; // Import necessary types

/**
 * Displays a toast notification using react-toastify.
 *
 * The `message` parameter should be pre-translated before being passed to this function,
 * as this function is a utility and does not handle translation itself.
 *
 * @param {string} message - The message content to display in the notification.
 * @param {'info' | 'success' | 'warning' | 'error'} [type='info'] - The type of notification,
 *   determining its style (e.g., color, icon). Defaults to 'info'.
 * @param {object} [options] - Optional settings for the toast notification.
 * @param {number} [options.autoClose] - Duration in milliseconds after which the toast will automatically close.
 *   Defaults to 3000ms (3 seconds).
 * @returns {React.ReactText} The ID of the toast notification.
 */
export default function notification(
    message: string,
    type: TypeOptions = 'info', // Use TypeOptions from react-toastify
    options?: ToastOptions // Use ToastOptions for more comprehensive type safety
) {
    // Default options are merged with any provided options.
    // react-toastify handles undefined options gracefully.
    return toast[type](message, {
        position: 'bottom-right',
        autoClose: options?.autoClose ?? 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
}

