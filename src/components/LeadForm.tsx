'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { leadSubmissionSchema } from '@/lib/validators';

interface FieldErrors {
  name?: string;
  email?: string;
  budget?: string;
  message?: string;
}

export default function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget: '$10k - $25k',
    message: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateField = (name: string, value: string) => {
    const updated = { ...formData, [name]: value };
    const result = leadSubmissionSchema.safeParse(updated);

    if (!result.success) {
      const fieldIssues = result.error.format();
      setErrors((prev) => ({
        ...prev,
        [name]: (fieldIssues as any)[name]?._errors?.[0] || undefined,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    // Run complete client validation
    const result = leadSubmissionSchema.safeParse(formData);
    if (!result.success) {
      const formatted = result.error.format();
      setErrors({
        name: formatted.name?._errors[0],
        email: formatted.email?._errors[0],
        budget: formatted.budget?._errors[0],
        message: formatted.message?._errors[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.error || 'Failed to submit form. Please try again.');
        if (data.details) {
          setErrors({
            name: data.details.name?._errors?.[0],
            email: data.details.email?._errors?.[0],
            budget: data.details.budget?._errors?.[0],
            message: data.details.message?._errors?.[0],
          });
        }
      } else {
        setSuccessMsg('Thank you! Your project inquiry has been received. Our team will contact you shortly.');
        setFormData({
          name: '',
          email: '',
          budget: '$10k - $25k',
          message: '',
        });
      }
    } catch (err) {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="form-header">
        <h2>Start Your Project</h2>
        <p>Fill out the details below to receive a custom proposal and quote.</p>
      </div>

      {successMsg && (
        <div className="alert-success">
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <div>{successMsg}</div>
        </div>
      )}

      {serverError && (
        <div className="alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Jane Doe"
            className={`form-input ${errors.name ? 'invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Work Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jane@company.com"
            className={`form-input ${errors.email ? 'invalid' : ''}`}
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="budget">
            Estimated Budget Range *
          </label>
          <select
            id="budget"
            name="budget"
            className={`form-select ${errors.budget ? 'invalid' : ''}`}
            value={formData.budget}
            onChange={handleChange}
          >
            <option value="< $5k">&lt; $5k</option>
            <option value="$5k - $10k">$5k - $10k</option>
            <option value="$10k - $25k">$10k - $25k</option>
            <option value="$25k - $50k">$25k - $50k</option>
            <option value="$50k+">$50k+</option>
          </select>
          {errors.budget && <span className="error-text">{errors.budget}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">
            Project Overview & Goals *
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your project requirements, timeline, and key goals..."
            className={`form-textarea ${errors.message ? 'invalid' : ''}`}
            value={formData.message}
            onChange={handleChange}
            required
          />
          {errors.message && <span className="error-text">{errors.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{ width: '100%', padding: '0.85rem' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
