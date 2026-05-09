export const getSupabaseErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("user already registered")) {
      return "This email is already registered. Please login instead.";
    }
    if (message.includes("invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }
    if (message.includes("email not confirmed")) {
      return "Please verify your email before logging in.";
    }
    if (message.includes("duplicate key")) {
      return "This record already exists. Please try again with different information.";
    }
    if (message.includes("constraint")) {
      return "Invalid data provided. Please check your inputs.";
    }
    if (message.includes("network")) {
      return "Network error. Please check your connection and try again.";
    }
    if (message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (message.includes("not found")) {
      return "The requested resource was not found.";
    }
    if (message.includes("unauthorized")) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes("server")) {
      return "Server error. Please try again later.";
    }

    return error.message;
  }

  const obj = error as Record<string, unknown>;
  if (obj.message) return String(obj.message);
  return "An unexpected error occurred";
};
