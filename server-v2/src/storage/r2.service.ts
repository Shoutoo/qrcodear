import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '..', '..', '..');
const LOCAL_UPLOADS_DIR = path.join(ROOT_DIR, 'server', 'uploads');

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private s3Client?: S3Client;
  private bucketName: string;
  private publicUrlBase: string;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'eduar-assets');
    this.publicUrlBase = this.configService.get<string>('R2_PUBLIC_URL_BASE', 'https://assets.eduar-platform.com');

    if (accountId && accessKeyId && secretAccessKey && !accessKeyId.includes('YOUR_')) {
      this.isConfigured = true;
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      this.logger.log('Cloudflare R2 credentials not fully set. Storage service operating in LOCAL DISK FALLBACK mode.');
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.s3Client) return false;
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return true;
    } catch (error) {
      this.logger.warn(`R2 Connection check failed: ${error.message}`);
      return false;
    }
  }

  async uploadWithFallback(key: string, buffer: Buffer, contentType: string): Promise<{ key: string; url: string; mode: 'R2' | 'LOCAL' }> {
    if (this.isConfigured && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        });
        await this.s3Client.send(command);
        const url = `${this.publicUrlBase.replace(/\/$/, '')}/${key}`;
        this.logger.log(`Uploaded file to Cloudflare R2: ${key} -> ${url}`);
        return { key, url, mode: 'R2' };
      } catch (err) {
        this.logger.warn(`Failed to upload to Cloudflare R2 (${err.message}). Falling back to local disk storage.`);
      }
    }

    // Local Disk Fallback
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
      fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
    }
    const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/assets/${key}`;
    this.logger.log(`Saved file to Local Disk Storage Fallback: ${localFilePath} -> ${localUrl}`);
    return { key, url: localUrl, mode: 'LOCAL' };
  }

  async deleteWithFallback(key: string): Promise<boolean> {
    let r2Success = false;
    if (this.isConfigured && this.s3Client) {
      try {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
        r2Success = true;
      } catch (err) {
        this.logger.warn(`Failed to delete from Cloudflare R2: ${err.message}`);
      }
    }

    const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return true;
  }
}
