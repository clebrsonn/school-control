import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchEnrollmentByStudent, fetchMonthlyFeesByParentId } from './MonthlyFeeService';
import { get } from '../config/axios/get';

// Mock the get function
vi.mock('../config/axios/get', () => ({
  get: vi.fn()
}));

describe('MonthlyFeeService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchMonthlyFeesByParentId', () => {
    it('should call get with the correct URL', async () => {
      // Arrange
      const parentId = '123';
      const mockTuitions = [{ id: '1', amount: 100 }, { id: '2', amount: 200 }];
      (get as any).mockResolvedValue(mockTuitions);

      // Act
      const result = await fetchMonthlyFeesByParentId(parentId);

      // Assert
      expect(get).toHaveBeenCalledWith(`/payments/parents/${parentId}`);
      expect(result).toEqual(mockTuitions);
    });

    it('should propagate errors from the get function', async () => {
      // Arrange
      const parentId = '123';
      const error = new Error('Network error');
      (get as any).mockRejectedValue(error);

      // Act & Assert
      await expect(fetchMonthlyFeesByParentId(parentId)).rejects.toThrow('Network error');
      expect(get).toHaveBeenCalledWith(`/payments/parents/${parentId}`);
    });
  });

  describe('fetchEnrollmentByStudent', () => {
    it('should call get with the correct URL', async () => {
      // Arrange
      const studentId = '456';
      const mockEnrollments = [{ id: '1', studentId: '456' }, { id: '2', studentId: '456' }];
      (get as any).mockResolvedValue(mockEnrollments);

      // Act
      const result = await fetchEnrollmentByStudent(studentId);

      // Assert
      expect(get).toHaveBeenCalledWith(`/enrollments/students/${studentId}`);
      expect(result).toEqual(mockEnrollments);
    });

    it('should propagate errors from the get function', async () => {
      // Arrange
      const studentId = '456';
      const error = new Error('API error');
      (get as any).mockRejectedValue(error);

      // Act & Assert
      await expect(fetchEnrollmentByStudent(studentId)).rejects.toThrow('API error');
      expect(get).toHaveBeenCalledWith(`/enrollments/students/${studentId}`);
    });
  });
});