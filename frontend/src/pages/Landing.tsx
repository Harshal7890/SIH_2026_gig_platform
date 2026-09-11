import { useNavigate } from 'react-router-dom';
import './Landing.css';

const roles = [
  {
    key: 'customer',
    name: 'User',
    description: 'Find and hire skilled workers for your needs',
    emoji: '👤',
    path: '/register/customer',
  },
  {
    key: 'worker',
    name: 'Worker',
    description: 'Showcase your skills and find gig opportunities',
    emoji: '🔧',
    path: '/register/worker',
  },
  {
    key: 'cooperative',
    name: 'Union',
    description: 'Manage workers and represent cooperatives',
    emoji: '🏛️',
    path: '/register/cooperative',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <main className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            SIH 2026 · Gig Platform
          </div>

          <h1 className="hero-title">
            Connect. Work. <span>Grow.</span>
          </h1>

          <p className="hero-subtitle">
            India's unified gig economy platform — empowering workers,
            customers, and cooperatives to collaborate seamlessly.
          </p>

          <div className="role-section">
            <p className="role-section-label">Choose your role to get started</p>

            <div className="role-cards">
              {roles.map((role) => (
                <button
                  key={role.key}
                  className="role-card"
                  onClick={() => navigate(role.path)}
                  aria-label={`Register as ${role.name}`}
                >
                  <div className="role-icon">{role.emoji}</div>
                  <div className="role-name">{role.name}</div>
                  <div className="role-description">{role.description}</div>
                  <div className="role-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>© 2026 GIG Platform · Smart India Hackathon 2026</p>
      </footer>
    </div>
  );
}
