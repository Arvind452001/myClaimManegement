import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container py-4">
      <h3>404 - Page not found</h3>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
