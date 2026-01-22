import { settingsService } from './settings.service';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  storage: 'local' | 'r2';
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

class UploadService {
  /**
   * Get current storage type from settings
   */
  async getStorageType(): Promise<'local' | 'r2'> {
    const storageType = await settingsService.getSettingValue('UPLOAD_STORAGE_TYPE');
    return (storageType === 'r2') ? 'r2' : 'local';
  }

  /**
   * Get R2 configuration from settings
   */
  async getR2Config(): Promise<R2Config | null> {
    const [accountId, accessKeyId, secretAccessKey, bucketName, publicUrl] = await Promise.all([
      settingsService.getSettingValue('R2_ACCOUNT_ID'),
      settingsService.getSettingValue('R2_ACCESS_KEY_ID'),
      settingsService.getSettingValue('R2_SECRET_ACCESS_KEY'),
      settingsService.getSettingValue('R2_BUCKET_NAME'),
      settingsService.getSettingValue('R2_PUBLIC_URL'),
    ]);

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      return null;
    }

    return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
  }

  /**
   * Upload image (base64) to configured storage
   */
  async uploadImage(base64Data: string, originalFilename?: string): Promise<UploadResult> {
    // Extract base64 data
    const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid image format. Expected base64 data URL');
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+', '');
    const imageData = matches[2];
    const uniqueFilename = `${uuidv4()}.${ext}`;

    const storageType = await this.getStorageType();

    if (storageType === 'r2') {
      return this.uploadToR2(imageData, uniqueFilename);
    } else {
      return this.uploadToLocal(imageData, uniqueFilename);
    }
  }

  /**
   * Upload to local storage
   */
  private async uploadToLocal(base64Data: string, filename: string): Promise<UploadResult> {
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, base64Data, 'base64');

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imageUrl = `${baseUrl}/uploads/${filename}`;

    return {
      success: true,
      url: imageUrl,
      filename,
      storage: 'local',
    };
  }

  /**
   * Upload to Cloudflare R2
   */
  private async uploadToR2(base64Data: string, filename: string): Promise<UploadResult> {
    const config = await this.getR2Config();
    if (!config) {
      throw new Error('R2 configuration is incomplete. Please configure R2 settings.');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const contentType = this.getContentType(filename);

    // Use S3-compatible API for R2
    const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${config.bucketName}/${filename}`;

    // Create signature for S3-compatible request
    const date = new Date().toUTCString();
    const signature = await this.createS3Signature(
      'PUT',
      `/${config.bucketName}/${filename}`,
      date,
      contentType,
      config.secretAccessKey
    );

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Date': date,
        'Authorization': `AWS ${config.accessKeyId}:${signature}`,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
    }

    const publicUrl = config.publicUrl.endsWith('/') 
      ? `${config.publicUrl}${filename}`
      : `${config.publicUrl}/${filename}`;

    return {
      success: true,
      url: publicUrl,
      filename,
      storage: 'r2',
    };
  }

  /**
   * Get content type from filename
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    return types[ext || ''] || 'application/octet-stream';
  }

  /**
   * Create S3-compatible signature (simplified HMAC-SHA1)
   */
  private async createS3Signature(
    method: string,
    resource: string,
    date: string,
    contentType: string,
    secretKey: string
  ): Promise<string> {
    const crypto = await import('crypto');
    const stringToSign = `${method}\n\n${contentType}\n${date}\n${resource}`;
    const hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(stringToSign);
    return hmac.digest('base64');
  }
}

export const uploadService = new UploadService();

