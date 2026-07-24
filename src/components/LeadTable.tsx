'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Clock, CheckCircle, Mail, AlertCircle, RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  budget: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('Failed to load leads data');
      }

      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        setStats(data.stats);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleStatusChange = async (id: string, newStatus: 'NEW' | 'CONTACTED' | 'CLOSED') => {
    setUpdatingId(id);
    // Optimistic state update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
    );

    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLeads(previousLeads); // rollback
        alert(data.error || 'Failed to update status');
      } else {
        // refresh stats
        fetchLeads();
      }
    } catch (err) {
      setLeads(previousLeads);
      alert('Network error while updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead for ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchLeads();
      } else {
        alert(data.error || 'Failed to delete lead');
      }
    } catch (err) {
      alert('Network error while deleting lead');
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <Mail className="text-primary" size={28} style={{ color: '#3b82f6' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">New Leads</div>
            <div className="stat-value" style={{ color: '#60a5fa' }}>
              {stats.new}
            </div>
          </div>
          <Clock size={28} style={{ color: '#60a5fa' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Contacted</div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>
              {stats.contacted}
            </div>
          </div>
          <RefreshCw size={28} style={{ color: '#fbbf24' }} />
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Closed / Won</div>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {stats.closed}
            </div>
          </div>
          <CheckCircle size={28} style={{ color: '#34d399' }} />
        </div>
      </div>

      {/* Controls Bar (Search & Filters) */}
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search leads by name, email, or message..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['ALL', 'NEW', 'CONTACTED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
            >
              {st === 'ALL' ? 'All Leads' : st}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading lead records...
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {searchQuery || statusFilter !== 'ALL'
              ? 'No leads match your filter criteria.'
              : 'No lead submissions yet.'}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Budget</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status Toggle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{lead.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lead.email}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {lead.budget}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={lead.message}
                    >
                      {lead.message}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(lead.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) =>
                        handleStatusChange(
                          lead.id,
                          e.target.value as 'NEW' | 'CONTACTED' | 'CLOSED'
                        )
                      }
                      className="status-select"
                      style={{
                        borderColor:
                          lead.status === 'NEW'
                            ? 'var(--status-new-border)'
                            : lead.status === 'CONTACTED'
                            ? 'var(--status-contacted-border)'
                            : 'var(--status-closed-border)',
                        color:
                          lead.status === 'NEW'
                            ? 'var(--status-new-text)'
                            : lead.status === 'CONTACTED'
                            ? 'var(--status-contacted-text)'
                            : 'var(--status-closed-text)',
                      }}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(lead.id, lead.name)}
                      className="btn-secondary"
                      style={{
                        padding: '0.35rem 0.6rem',
                        background: 'transparent',
                        borderColor: 'transparent',
                        color: 'var(--danger-text)',
                      }}
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
