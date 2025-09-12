import type { ResearchResult } from '../types';
import { functions, GENERATE_FUNCTION_ID } from './appwrite';
// FIX: Imported ExecutionMethod to use the correct enum for the 'method' parameter.
import { AppwriteException, ExecutionMethod } from 'appwrite';

export const generateResearch = async (topic: string): Promise<ResearchResult> => {
  try {
    const execution = await functions.createExecution(
      GENERATE_FUNCTION_ID,
      JSON.stringify({ topic }),
      false, // async
      '/',   // path
      // FIX: Used the ExecutionMethod.POST enum instead of the incorrect raw string 'Post'.
      ExecutionMethod.POST // method
    );

    if (execution.status === 'completed') {
      if (execution.responseBody) {
        return JSON.parse(execution.responseBody);
      }
      throw new Error("Function executed successfully but returned an empty response.");
    } else {
      const errorData = execution.responseBody ? JSON.parse(execution.responseBody) : { error: 'Unknown function error' };
      throw new Error(errorData.error || `Function execution failed with status: ${execution.status}`);
    }
  } catch (error) {
      console.error('Appwrite function execution error:', error);
      if (error instanceof AppwriteException) {
          throw new Error(error.message);
      } else if (error instanceof Error) {
          throw error;
      }
      throw new Error('An unknown error occurred while communicating with the server.');
  }
};