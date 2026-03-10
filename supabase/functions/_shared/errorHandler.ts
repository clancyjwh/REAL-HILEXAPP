export interface ErrorResponse {
  error: string;
  details?: string;
}

export function createErrorResponse(
  message: string,
  status: number,
  corsHeaders: HeadersInit,
  includeDetails: boolean = false,
  details?: string
): Response {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

  const errorBody: ErrorResponse = {
    error: message,
  };

  if (includeDetails && isDevelopment && details) {
    errorBody.details = details;
  }

  return new Response(
    JSON.stringify(errorBody),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function handleUnexpectedError(
  error: unknown,
  corsHeaders: HeadersInit
): Response {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

  let errorMessage = 'An unexpected error occurred';
  let errorDetails: string | undefined;

  if (error instanceof Error) {
    errorDetails = error.message;
    if (isDevelopment) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('Error occurred:', error.message);
    }
  } else {
    console.error('Unknown error:', error);
  }

  return createErrorResponse(
    errorMessage,
    500,
    corsHeaders,
    isDevelopment,
    errorDetails
  );
}

export function logError(context: string, error: unknown): void {
  const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development';

  if (isDevelopment) {
    console.error(`[${context}] Error:`, error);
  } else {
    if (error instanceof Error) {
      console.error(`[${context}] ${error.message}`);
    } else {
      console.error(`[${context}] An error occurred`);
    }
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}
