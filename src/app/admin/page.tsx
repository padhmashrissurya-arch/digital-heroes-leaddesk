import LeadTable from '@/components/LeadTable';
import { LayoutDashboard } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | LeadDesk Mini',
};

export default function AdminPage() {
  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LayoutDashboard className="text-primary" size={24} style={{ color: '#3b82f6' }} />
            <h1 className="admin-title">Lead Management Console</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            View, search, filter, and update status for all incoming client leads.
          </p>
        </div>
      </div>

      <LeadTable />
    </div>
  );
}
