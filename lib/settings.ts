import { db } from './db';

export interface SiteSetting {
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  description: string | null;
}

export interface UploadedImage {
  image_key: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
}

/**
 * Get all settings grouped by category
 */
export async function getAllSettings() {
  const client = await db.connect();
  
  try {
    const { rows } = await client.query(
      'SELECT * FROM site_settings ORDER BY category, setting_key'
    );
    
    // Group by category
    const grouped: Record<string, Record<string, any>> = {};
    
    rows.forEach((row: SiteSetting) => {
      if (!grouped[row.category]) {
        grouped[row.category] = {};
      }
      
      // Parse JSON values
      let value = row.setting_value;
      if (row.setting_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse JSON for ${row.setting_key}:`, e);
        }
      }
      
      grouped[row.category][row.setting_key.replace(`${row.category}_`, '')] = value;
    });
    
    return grouped;
  } finally {
    client.release();
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const client = await db.connect();
    
    try {
      const { rows } = await client.query(
        'SELECT setting_value, setting_type FROM site_settings WHERE setting_key = $1',
        [key]
      );
      
      if (rows.length === 0) return null;
      
      const { setting_value, setting_type } = rows[0];
      
      if (setting_type === 'json' && setting_value) {
        try {
          return JSON.parse(setting_value);
        } catch (e) {
          return setting_value;
        }
      }
      
      return setting_value;
    } finally {
      client.release();
    }
  } catch (error) {
    // During build or if database unavailable, return null (fallback will be used)
    console.warn(`Database unavailable for setting ${key}, using fallback`);
    return null;
  }
}

/**
 * Update a setting
 */
export async function updateSetting(
  key: string,
  value: any,
  updatedBy?: string
): Promise<boolean> {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get old value for history
    const oldResult = await client.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = $1',
      [key]
    );
    
    const oldValue = oldResult.rows[0]?.setting_value;
    
    // Stringify if object/array
    const newValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Update setting
    const result = await client.query(
      `UPDATE site_settings 
       SET setting_value = $1, updated_at = NOW(), updated_by = $2 
       WHERE setting_key = $3`,
      [newValue, updatedBy, key]
    );
    
    // Record history
    if (oldValue !== newValue) {
      await client.query(
        `INSERT INTO settings_history (setting_key, old_value, new_value, changed_by) 
         VALUES ($1, $2, $3, $4)`,
        [key, oldValue, newValue, updatedBy]
      );
    }
    
    await client.query('COMMIT');
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating setting:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  updates: Record<string, any>,
  updatedBy?: string
): Promise<boolean> {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(updates)) {
      await updateSetting(key, value, updatedBy);
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', error);
    return false;
  } finally {
    client.release();
  }
}

export function formatImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  return url;
}

export async function getAllImages(): Promise<Record<string, UploadedImage>> {
  try {
    const client = await db.connect();

    try {
      const { rows } = await client.query(
        'SELECT * FROM uploaded_images ORDER BY image_key'
      );

      const images: Record<string, UploadedImage> = {};
      rows.forEach((row: UploadedImage) => {
        images[row.image_key] = {
          ...row,
          file_url: formatImageUrl(row.file_url) || row.file_url,
        };
      });

      return images;
    } finally {
      client.release();
    }
  } catch (error) {
    // During build or if database unavailable, return empty object (fallbacks will be used)
    console.warn('Database unavailable for images, using fallbacks');
    return {};
  }
}

export async function getImage(imageKey: string): Promise<UploadedImage | null> {
  try {
    const client = await db.connect();

    try {
      const { rows } = await client.query(
        'SELECT * FROM uploaded_images WHERE image_key = $1',
        [imageKey]
      );

      if (rows.length === 0) return null;

      const img = rows[0];
      return {
        ...img,
        file_url: formatImageUrl(img.file_url) || img.file_url,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    // During build or if database unavailable, return null (fallback will be used)
    console.warn(`Database unavailable for image ${imageKey}, using fallback`);
    return null;
  }
}

/**
 * Save/update uploaded image metadata
 */
export async function saveImage(
  imageKey: string,
  imageData: Partial<UploadedImage>,
  uploadedBy?: string
): Promise<boolean> {
  const client = await db.connect();
  
  try {
    const { rows } = await client.query(
      `INSERT INTO uploaded_images (
        image_key, file_name, file_path, file_url, 
        file_size, mime_type, width, height, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (image_key) 
      DO UPDATE SET 
        file_name = $2,
        file_path = $3,
        file_url = $4,
        file_size = $5,
        mime_type = $6,
        width = $7,
        height = $8,
        uploaded_at = NOW(),
        uploaded_by = $9
      RETURNING *`,
      [
        imageKey,
        imageData.file_name,
        imageData.file_path,
        imageData.file_url,
        imageData.file_size,
        imageData.mime_type,
        imageData.width,
        imageData.height,
        uploadedBy,
      ]
    );
    
    return rows.length > 0;
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Delete an image
 */
export async function deleteImage(imageKey: string): Promise<boolean> {
  const client = await db.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM uploaded_images WHERE image_key = $1',
      [imageKey]
    );
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get settings history for a specific key
 */
export async function getSettingHistory(key: string, limit: number = 10) {
  const client = await db.connect();
  
  try {
    const { rows } = await client.query(
      `SELECT * FROM settings_history 
       WHERE setting_key = $1 
       ORDER BY changed_at DESC 
       LIMIT $2`,
      [key, limit]
    );
    
    return rows;
  } finally {
    client.release();
  }
}
