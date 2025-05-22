# School Management System

This project is a web application designed to manage various aspects of an educational institution. It allows for the administration of students, parents, classes, payments, and more.

## Tech Stack

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **Styling:** React-Bootstrap, CSS
*   **State Management:** React Context API, `useState`/`useReducer`
*   **Routing:** React Router
*   **HTTP Client:** Axios
*   **Testing:** Vitest, React Testing Library
*   **Linting:** ESLint
*   **Formatting:** Prettier

## Features

*   User Authentication
*   Student Management (CRUD operations)
*   Parent/Responsible Management (CRUD operations)
*   Class Management (CRUD operations)
*   Payment Management and Tracking
*   Discount Management
*   Expense Tracking
*   Notification System
*   (Potentially more, based on a deeper dive into features)

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Add any necessary environment variables (e.g., API base URL). Example:
        ```env
        VITE_SERVICE_URL=http://localhost:8080
        ```
    *   (You might need to specify which variables are actually used/required based on `src/config/axiosConfig.ts` or similar files.)

## Development

To run the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173`.

## Testing

To run the unit and component tests:

```bash
npm run test
```

This will execute tests using Vitest and provide a coverage report.

## Building for Production

To build the application for production:

```bash
npm run build
```

The production-ready files will be located in the `dist/` directory.

---

_This README provides a general overview. Further details on specific components and functionalities can be found within the source code documentation._
