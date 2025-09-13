import { validateBlueprintIdea, validateBlueprintTitle, sanitizeInput } from '@/lib/validation';

describe('Validation', () => {
  describe('validateBlueprintIdea', () => {
    it('should validate a good idea', () => {
      const result = validateBlueprintIdea('Create an AI-powered fintech startup that helps small businesses manage their finances');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty idea', () => {
      const result = validateBlueprintIdea('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Please enter your startup idea');
    });

    it('should reject idea that is too short', () => {
      const result = validateBlueprintIdea('AI app');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least 10 characters');
    });

    it('should reject idea that is too long', () => {
      const longIdea = 'A'.repeat(1001);
      const result = validateBlueprintIdea(longIdea);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('under 1000 characters');
    });

    it('should reject idea with malicious content', () => {
      const result = validateBlueprintIdea('Create an app <script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('potentially harmful content');
    });
  });

  describe('validateBlueprintTitle', () => {
    it('should validate a good title', () => {
      const result = validateBlueprintTitle('AI Fintech Blueprint');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const result = validateBlueprintTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Title is required');
    });

    it('should reject title that is too short', () => {
      const result = validateBlueprintTitle('AI');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('at least 3 characters');
    });

    it('should reject title that is too long', () => {
      const longTitle = 'A'.repeat(101);
      const result = validateBlueprintTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('under 100 characters');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeInput('Hello <script>alert("xss")</script> world');
      expect(result).toBe('Hello  world');
    });

    it('should remove javascript: protocols', () => {
      const result = sanitizeInput('javascript:alert("xss")');
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const result = sanitizeInput('onclick="alert(\'xss\')"');
      expect(result).toBe('alert(\'xss\')"');
    });

    it('should trim whitespace', () => {
      const result = sanitizeInput('  hello world  ');
      expect(result).toBe('hello world');
    });
  });
});
