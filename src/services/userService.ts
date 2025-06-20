// src/services/userService.ts
const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || 'http://localhost:5000';

export async function deleteUserAccount(userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    throw new Error('User ID is required to delete an account.');
  }
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userId}/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to delete account.');
    }
    return { success: true, message: responseData.message };
  } catch (error: any) {
    console.error("Error in deleteUserAccount service:", error);
    throw new Error(error.message || 'An unknown error occurred while deleting the account.');
  }
}

export async function requestDataExport(userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    throw new Error('User ID is required to request a data export.');
  }
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/users/${userId}/request-data-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to request data export.');
    }
    return { success: true, message: responseData.message };
  } catch (error: any) {
    console.error("Error in requestDataExport service:", error);
    throw new Error(error.message || 'An unknown error occurred while requesting data export.');
  }
}
