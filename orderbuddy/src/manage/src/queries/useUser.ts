import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from './axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ApiResponse } from './api-response';
import { handleApiResponse } from './apiHandle';
import { logExceptionError } from '../utils/errorLogger';

interface CreateUserDto {
  userId: string;
  email?: string;
  phoneNumber?: string;
  createdAt: number;
}

// interface User {
//   _id: string;
//   restaurants: string[];
//   name: string;
//   userId: string;
//   email: string;
// }

export const createUserApi = async (userData: CreateUserDto) => {
  try {
    const response = await axiosInstance.post('users/create-user', userData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    // Log to Application Insights
    logExceptionError(error, 'createUserApi', {
      endpoint: 'users/create-user',
      userId: userData.userId,
      email: userData.email ? true : false // Just log if email was provided, not the actual email
    });
    throw error;
  }
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUserApi,
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

const userSchema = z.object({
  userId: z.string().uuid(),
  restaurants: z.array(z.string()),
  email: z.string().email().nullable().optional(),
});
export type User = z.infer<typeof userSchema>;
export const fetchUserSession = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<ApiResponse<User>>('restaurant/user/session');

    const userData = response.data;

    try {
      const validatedData = userSchema.parse(userData);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        console.error('Received data:', userData);
        // Log validation error
        logExceptionError(
          new Error('Invalid user session data format'),
          'fetchUserSession.validation',
          {
            zodErrors: JSON.stringify(error.errors),
            // Don't log full user data as it may contain PII
            receivedDataKeys: Object.keys(userData || {})
          }
        );
        throw new Error('Invalid user session data format');
      }
      // Log general error
      logExceptionError(error, 'fetchUserSession.validation', {});
      throw error;
    }
  } catch (error) {
    console.error('Session fetch error:', error);
    // Log API error
    logExceptionError(error, 'fetchUserSession.api', {
      endpoint: 'restaurant/user/session'
    });
    throw error;
  }
};

export const useUserSession = () => {
  return useQuery({
    queryKey: ['userSession'],
    queryFn: fetchUserSession,
  });
};
