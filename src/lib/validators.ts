import { z } from 'zod';

export const leadSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  budget: z.enum(['< $5k', '$5k - $10k', '$10k - $25k', '$25k - $50k', '$50k+'], {
    required_error: 'Please select a valid budget range',
  }),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid admin email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const leadStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED'], {
    required_error: 'Invalid status value',
  }),
});
