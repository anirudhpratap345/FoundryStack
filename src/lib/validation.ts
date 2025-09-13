// Input validation utilities
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate blueprint idea input
export function validateBlueprintIdea(idea: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!idea || idea.trim().length === 0) {
    errors.push({
      field: 'idea',
      message: 'Please enter your startup idea'
    });
  } else if (idea.trim().length < 10) {
    errors.push({
      field: 'idea',
      message: 'Please provide a more detailed description (at least 10 characters)'
    });
  } else if (idea.trim().length > 1000) {
    errors.push({
      field: 'idea',
      message: 'Please keep your idea under 1000 characters'
    });
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(idea)) {
      errors.push({
        field: 'idea',
        message: 'Please remove potentially harmful content from your idea'
      });
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate blueprint title
export function validateBlueprintTitle(title: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required'
    });
  } else if (title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 3 characters long'
    });
  } else if (title.trim().length > 100) {
    errors.push({
      field: 'title',
      message: 'Title must be under 100 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate email (for future user accounts)
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  } else if (!emailRegex.test(email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length === 0) {
      return now;
    }
    
    return validRequests[0] + this.windowMs;
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(60000, 5); // 5 requests per minute
