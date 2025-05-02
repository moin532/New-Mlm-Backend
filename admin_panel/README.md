# React Admin Panel (Simplified & Connected)

This project is a simplified, beginner-friendly React-based frontend Admin Panel designed to work with the specific backend Admin module created previously (using a separate Admin model and `/api/v1/admin/...` endpoints).

This version uses plain JavaScript (JSX) and basic CSS, removing TypeScript and complex UI libraries for easier understanding. It has been connected to the backend to allow admins to log in and manage products.

## Features

*   **Admin Authentication:** Secure login specifically for admins using the `/api/v1/admin/login` endpoint (expects username and password).
*   **Protected Routes:** Only authenticated admins can access the dashboard and product management sections (`/dashboard`, `/products`, `/products/add`, `/products/edit/:id`) using the `ProtectedRoute` component.
*   **Product Management (CRUD):**
    *   **View Products:** Displays a list of all products fetched from `/api/v1/admin/products` in a basic HTML table.
    *   **Add Products:** A form using standard HTML elements to add new products via `POST /api/v1/admin/products`, including details like name, description, category, stock, and image uploads (using FormData).
    *   **Edit Products:** A form using standard HTML elements to modify existing product details via `PUT /api/v1/admin/products/:id`. Fetches initial data using the public `/api/v1/product/:id` endpoint. (Image editing not implemented).
    *   **Delete Products:** Functionality to remove products via `DELETE /api/v1/admin/products/:id`, with a confirmation prompt.
*   **Image Upload:** Supports uploading multiple images when adding a product, utilizing the backend's Multer setup via the admin endpoint.
*   **Simple Styling:** Uses basic CSS defined in `src/index.css` for layout and styling.

## Project Structure (Simplified)

```
/home/ubuntu/admin_panel/
├── public/
├── src/
│   ├── components/         # Reusable UI components (ProtectedRoute.jsx)
│   ├── pages/              # Page components (LoginPage.jsx, ProductsPage.jsx, etc.)
│   ├── services/           # API interaction logic (authService.js, productService.js, AuthContext.js)
│   ├── App.jsx             # Main application component with routing
│   ├── index.css           # Basic global styles
│   └── main.jsx            # Application entry point
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── vite.config.js        # Simplified Vite configuration
```

## Key Technologies Used

*   **React:** Frontend library (using JSX).
*   **React Router DOM:** For client-side routing.
*   **Axios:** For making HTTP requests to the backend API.
*   **CSS:** Basic CSS for styling.
*   **Vite:** Frontend build tool.
*   **pnpm:** Package manager.

## Setup and Running

1.  **Prerequisites:**
    *   Node.js and pnpm installed.
    *   The corresponding backend server (with the separate Admin module) must be running (likely on `http://localhost:4000`).

2.  **Installation:**
    *   Navigate to the project directory: `cd /path/to/admin_panel` (after extracting the zip)
    *   Install dependencies: `pnpm install`

3.  **Configuration:**
    *   The backend API URL is hardcoded in `src/services/authService.js` and `src/services/productService.js` as `http://localhost:4000/api/v1`. Ensure this matches your running backend.
    *   Product images are assumed to be served by the backend at the root `/uploads` path (e.g., `http://localhost:4000/uploads/imagename.png`). Verify this matches your backend setup in `app.js` (`app.use("/uploads", express.static("uploads"));`).

4.  **Running the Development Server:**
    *   Start the dev server: `pnpm run dev`
    *   The application will typically be available at `http://localhost:5173`.

5.  **Admin Login:**
    *   Use the default admin credentials configured in the backend (`server.js`):
        *   Username: `admin`
        *   Password: `password123`

## Important Notes

*   **Backend Dependency:** This frontend requires the specific backend API structure implemented previously (with the separate Admin model and `/api/v1/admin/...` routes).
*   **Image Updates:** Image editing/updating is not implemented in the edit form.
*   **User Management:** This frontend version focuses only on Product Management for the admin. Admin User Management features (add/edit/delete users) are implemented in the backend but not connected in this frontend.
*   **Simplicity:** Code is kept simple using basic React concepts and standard HTML elements for forms and tables. Complex UI libraries and TypeScript have been removed.
*   **Error Handling:** Basic error handling is implemented, including logging out the user on authorization errors (401).

