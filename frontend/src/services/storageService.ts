import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface StorageUploadResult {
  url: string;
  path: string;
  verified: boolean;
}

export type StorageBucket = "avatars" | "reports";

export interface StorageBucketsStatus {
  avatars: boolean;
  reports: boolean;
  checked: boolean;
  error?: string;
}

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const MAX_REPORT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB limit

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const storageService = {
  /**
   * Check whether 'avatars' and 'reports' storage buckets exist in Supabase.
   */
  async checkBucketsStatus(): Promise<StorageBucketsStatus> {
    if (!isSupabaseConfigured) {
      return {
        avatars: false,
        reports: false,
        checked: true,
        error: "Supabase is not configured.",
      };
    }

    try {
      // Test avatars bucket accessibility
      const { error: avatarsError } = await supabase.storage.from("avatars").list("", { limit: 1 });
      const avatarsExist = !avatarsError || !avatarsError.message.toLowerCase().includes("not found");

      // Test reports bucket accessibility
      const { error: reportsError } = await supabase.storage.from("reports").list("", { limit: 1 });
      const reportsExist = !reportsError || !reportsError.message.toLowerCase().includes("not found");

      return {
        avatars: avatarsExist,
        reports: reportsExist,
        checked: true,
        error: avatarsError?.message || reportsError?.message,
      };
    } catch (err: unknown) {
      return {
        avatars: false,
        reports: false,
        checked: true,
        error: err instanceof Error ? err.message : "Failed to check bucket status.",
      };
    }
  },

  /**
   * Retrieves the public access URL for a file stored in Supabase Storage.
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    if (!path) return "";
    // If the path is already a full HTTPS URL, return as-is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Helper to extract relative storage path from full URL or relative path string.
   */
  extractStoragePath(bucket: StorageBucket, pathOrUrl: string): string {
    if (!pathOrUrl) return "";
    if (!pathOrUrl.startsWith("http://") && !pathOrUrl.startsWith("https://")) {
      return pathOrUrl;
    }
    try {
      const url = new URL(pathOrUrl);
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        return decodeURIComponent(url.pathname.substring(idx + marker.length));
      }
    } catch {
      // Return as-is if URL parsing fails
    }
    return pathOrUrl;
  },

  /**
   * Verify an uploaded file exists in Supabase Storage after upload.
   */
  async verifyUpload(bucket: StorageBucket, path: string): Promise<boolean> {
    if (!isSupabaseConfigured || !path) return false;

    try {
      const folderPath = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "";
      const fileName = path.includes("/") ? path.substring(path.lastIndexOf("/") + 1) : path;

      const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
        search: fileName,
      });

      if (error) {
        console.warn(`⚠️ Storage verification warning for ${bucket}/${path}:`, error.message);
        return false;
      }

      const found = data?.some((item) => item.name === fileName);
      return Boolean(found);
    } catch (err: unknown) {
      console.warn(`⚠️ Storage verification exception for ${bucket}/${path}:`, err);
      return false;
    }
  },

  /**
   * Upload user profile avatar image to Supabase Storage bucket 'avatars'.
   * Path format: avatars/{userId}/{timestamp}_{filename}
   */
  async uploadAvatar(userId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Please check your environment variables.");
    }
    if (!userId) {
      throw new Error("User ID is required for uploading an avatar.");
    }
    if (!file) {
      throw new Error("No image file selected for upload.");
    }

    // 1. File type validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      throw new Error("Invalid image format. Supported formats: JPEG, PNG, WebP, GIF, SVG.");
    }

    // 2. File size validation
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw new Error("File size exceeds 5 MB limit. Please select a smaller image.");
    }

    // Sanitize file name
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

    try {
      // 3. Upload file to 'avatars' bucket
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("permission") || msg.includes("row-level security") || msg.includes("policy")) {
          throw new Error("Permission denied. You can only update your own avatar.");
        }
        if (msg.includes("bucket not found") || msg.includes("not_found")) {
          throw new Error(
            "Storage bucket 'avatars' not found in Supabase. Please run the provided SQL migration script to create the bucket."
          );
        }
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error("Upload completed but no path was returned by storage.");
      }

      // 4. Verify upload in Supabase Storage (Task 8)
      const verified = await this.verifyUpload("avatars", data.path);
      const publicUrl = this.getPublicUrl("avatars", data.path);

      return {
        url: publicUrl,
        path: data.path,
        verified,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          throw new Error("Network failure while uploading avatar. Please check your internet connection.");
        }
        throw err;
      }
      throw new Error("An unexpected error occurred during avatar upload.");
    }
  },

  /**
   * Delete avatar file from Supabase Storage bucket 'avatars'.
   */
  async deleteAvatar(pathOrUrl: string): Promise<void> {
    if (!isSupabaseConfigured || !pathOrUrl) return;

    const path = this.extractStoragePath("avatars", pathOrUrl);
    if (!path) return;

    try {
      const { error } = await supabase.storage.from("avatars").remove([path]);
      if (error) {
        console.warn("⚠️ Warning deleting avatar from storage:", error.message);
      }
    } catch (err: unknown) {
      console.warn("⚠️ Non-blocking exception deleting avatar:", err);
    }
  },

  /**
   * Upload report file (PDF, XLSX, DOCX, CSV) to Supabase Storage bucket 'reports'.
   * Path format: reports/{reportId}/{timestamp}_{filename}
   */
  async uploadReport(reportId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Please check your environment variables.");
    }
    if (!reportId) {
      throw new Error("Report ID is required for uploading a report file.");
    }
    if (!file) {
      throw new Error("No report file selected for upload.");
    }

    if (file.size > MAX_REPORT_SIZE_BYTES) {
      throw new Error("File size exceeds 25 MB limit for report uploads.");
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${reportId}/${Date.now()}_${sanitizedFileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("reports")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("permission") || msg.includes("policy")) {
          throw new Error("Permission denied. Insufficient rights to upload report files.");
        }
        if (msg.includes("bucket not found") || msg.includes("not_found")) {
          throw new Error("Storage bucket 'reports' not found in Supabase.");
        }
        throw new Error(`Report upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error("Upload completed but no file path was returned.");
      }

      // Verify report upload (Task 8)
      const verified = await this.verifyUpload("reports", data.path);
      const publicUrl = this.getPublicUrl("reports", data.path);

      return {
        url: publicUrl,
        path: data.path,
        verified,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          throw new Error("Network failure while uploading report file.");
        }
        throw err;
      }
      throw new Error("An unexpected error occurred during report upload.");
    }
  },
};
