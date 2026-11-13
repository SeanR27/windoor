# API client

<!-- Shared HTTP transport and error handling belong in this folder. -->

Create one small fetch wrapper here after the backend API shape is known. It should read `VITE_API_URL`, serialize requests, normalize errors, and avoid importing feature code.
