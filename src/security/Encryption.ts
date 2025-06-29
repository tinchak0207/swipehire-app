export class EncryptionService {
  public encrypt(data: string): string {
    // In a real application, this would use a strong encryption algorithm.
    return `encrypted_${data}`;
  }

  public decrypt(data: string): string {
    // In a real application, this would use a strong decryption algorithm.
    return data.replace('encrypted_', '');
  }
}
