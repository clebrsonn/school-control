import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelEnrollment,
  enrollStudent,
  enrollStudentLegacy,
  getStudentEnrollments,
  renewEnrollment
} from './EnrollmentService';
import { get, post } from '../../../config/axios';
import { EnrollmentRequest, EnrollmentResponse } from '../types/EnrollmentTypes';

// Mock the axios functions
vi.mock('../../../config/axios', () => ({
  get: vi.fn(),
  post: vi.fn()
}));

describe('EnrollmentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('enrollStudent', () => {
    it('should call post with the correct URL and data', async () => {
      // Arrange
      const enrollmentRequest: EnrollmentRequest = {
        studentId: '123',
        classRoomId: '456',
        enrollmentFee: 100,
        monthyFee: 50
      };
      
      const mockResponse: EnrollmentResponse = {
        id: 'enroll1',
        studentId: '123',
        studentName: 'John Doe',
        classRoomId: '456',
        classRoomName: 'Class A',
        classRoomYear: '2023',
        enrollmentDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: 'ACTIVE'
      };
      
      (post as any).mockResolvedValue(mockResponse);

      // Act
      const result = await enrollStudent(enrollmentRequest);

      // Assert
      expect(post).toHaveBeenCalledWith('/enrollments', enrollmentRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from the post function', async () => {
      // Arrange
      const enrollmentRequest: EnrollmentRequest = {
        studentId: '123',
        classRoomId: '456'
      };
      
      const error = new Error('Failed to enroll student');
      (post as any).mockRejectedValue(error);

      // Act & Assert
      await expect(enrollStudent(enrollmentRequest)).rejects.toThrow('Failed to enroll student');
      expect(post).toHaveBeenCalledWith('/enrollments', enrollmentRequest);
    });
  });

  describe('getStudentEnrollments', () => {
    it('should call get with the correct URL', async () => {
      // Arrange
      const studentId = '123';
      const mockEnrollments: EnrollmentResponse[] = [
        {
          id: 'enroll1',
          studentId: '123',
          studentName: 'John Doe',
          classRoomId: '456',
          classRoomName: 'Class A',
          classRoomYear: '2023',
          enrollmentDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: 'ACTIVE'
        }
      ];
      
      (get as any).mockResolvedValue(mockEnrollments);

      // Act
      const result = await getStudentEnrollments(studentId);

      // Assert
      expect(get).toHaveBeenCalledWith(`/enrollments/students/${studentId}`);
      expect(result).toEqual(mockEnrollments);
    });

    it('should propagate errors from the get function', async () => {
      // Arrange
      const studentId = '123';
      const error = new Error('Failed to get enrollments');
      (get as any).mockRejectedValue(error);

      // Act & Assert
      await expect(getStudentEnrollments(studentId)).rejects.toThrow('Failed to get enrollments');
      expect(get).toHaveBeenCalledWith(`/enrollments/students/${studentId}`);
    });
  });

  describe('enrollStudentLegacy', () => {
    it('should call post with the correct URL and data', async () => {
      // Arrange
      const studentId = '123';
      const classId = '456';
      const enrollmentFee = 100;
      const monthyFee = 50;
      
      const mockResponse = { id: 'enroll1' };
      (post as any).mockResolvedValue(mockResponse);

      // Act
      const result = await enrollStudentLegacy(studentId, classId, enrollmentFee, monthyFee);

      // Assert
      expect(post).toHaveBeenCalledWith('/enrollments', { 
        studentId, 
        classRoomId: classId, 
        enrollmentFee, 
        monthyFee 
      });
      expect(result).toEqual(mockResponse);
    });

    it('should use default values for fees if not provided', async () => {
      // Arrange
      const studentId = '123';
      const classId = '456';
      
      const mockResponse = { id: 'enroll1' };
      (post as any).mockResolvedValue(mockResponse);

      // Act
      const result = await enrollStudentLegacy(studentId, classId);

      // Assert
      expect(post).toHaveBeenCalledWith('/enrollments', { 
        studentId, 
        classRoomId: classId, 
        enrollmentFee: 0, 
        monthyFee: 0 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelEnrollment', () => {
    it('should call get with the correct URL', async () => {
      // Arrange
      const enrollmentId = 'enroll1';
      const mockResponse = { success: true };
      (get as any).mockResolvedValue(mockResponse);

      // Act
      const result = await cancelEnrollment(enrollmentId);

      // Assert
      expect(get).toHaveBeenCalledWith(`/enrollments/${enrollmentId}/cancel`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('renewEnrollment', () => {
    it('should call get with the correct URL', async () => {
      // Arrange
      const enrollmentId = 'enroll1';
      const mockResponse = { enrollmentId: 'enroll1' };
      (get as any).mockResolvedValue(mockResponse);

      // Act
      const result = await renewEnrollment(enrollmentId);

      // Assert
      expect(get).toHaveBeenCalledWith(`/enrollments/${enrollmentId}/renew`);
      expect(result).toEqual(mockResponse);
    });
  });
});