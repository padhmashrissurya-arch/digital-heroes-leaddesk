import LeadForm from '@/components/LeadForm';
import { ShieldCheck, Zap, Layers, Lock, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="container">
      <section className="hero-grid">
        {/* Left Column: Hero Copy */}
        <div>
          <div
            className="pill"
            style={{ display: 'inline-flex', marginBottom: '1.25rem' }}
          >
            <Zap size={14} style={{ color: '#3b82f6' }} />
            <span>Lead Capture Engine 2.0</span>
          </div>

          <h1 className="hero-title">
            Capture Leads & Turn Inquiries Into <span className="gradient-text">Clients</span>.
          </h1>

          <p className="hero-subtitle">
            LeadDesk Mini is a full-stack lead management solution designed for modern digital agencies and consultants. Server-validated, secure, and instant.
          </p>

          <div className="feature-pills">
            <div className="pill">
              <ShieldCheck size={14} style={{ color: '#34d399' }} />
              Dual-Layer Validation
            </div>
            <div className="pill">
              <Lock size={14} style={{ color: '#60a5fa' }} />
              Session & Cookie Auth
            </div>
            <div className="pill">
              <Layers size={14} style={{ color: '#c084fc' }} />
              Real-time Admin Dashboard
            </div>
          </div>
        </div>

        {/* Right Column: Lead Capture Form */}
        <div>
          <LeadForm />
        </div>
      </section>
    </div>
  );
}
