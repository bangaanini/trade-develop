"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface ImageData {
  image_key: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
}

function formatImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  return url;
}

export default function ImageManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const [images, setImages] = useState<Record<string, ImageData>>({});
  
  const fileInputRefs = {
    hero_bg: useRef<HTMLInputElement>(null),
    mobile_slide1: useRef<HTMLInputElement>(null),
    mobile_slide2: useRef<HTMLInputElement>(null),
    mobile_slide3: useRef<HTMLInputElement>(null),
    logo: useRef<HTMLInputElement>(null),
    favicon: useRef<HTMLInputElement>(null),
    og_image: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      if (data.success) {
        setImages(data.data.images || {});
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Error loading images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (imageKey: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/ico'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      toast.error('Only JPEG, PNG, WebP, and ICO files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(imageKey);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageKey', imageKey);

      const res = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Image uploaded successfully!');
        // Refresh images
        await fetchImages();
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (imageKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(imageKey, file);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/settings')}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          ← Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Image Manager</h1>
        <p className="text-muted-foreground">Upload and manage site images</p>
      </div>

      <div className="space-y-8">
        {/* Hero Background */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hero Background</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {images.hero_bg?.file_url && (
                <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden mb-4 border border-border">
                  <img
                    src={formatImageUrl(images.hero_bg.file_url)}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Current: {images.hero_bg?.file_name || 'banner.png'}</div>
                <div>Size: {formatFileSize(images.hero_bg?.file_size)}</div>
                <div className="text-xs mt-2">Recommended: 1920x600px, max 5MB</div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <button
                onClick={() => fileInputRefs.hero_bg.current?.click()}
                disabled={uploading === 'hero_bg'}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading === 'hero_bg' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>Upload New Background</>
                )}
              </button>
              <input
                ref={fileInputRefs.hero_bg}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect('hero_bg', e)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Mobile Sliders */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mobile Hero Sliders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['mobile_slide1', 'mobile_slide2', 'mobile_slide3'].map((key, index) => (
              <div key={key}>
                <h3 className="font-medium mb-3">Slide {index + 1}</h3>
                {images[key]?.file_url && (
                  <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden mb-3 border border-border">
                    <img
                      src={formatImageUrl(images[key].file_url)}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-xs text-muted-foreground mb-3">
                  <div>{images[key]?.file_name || `slide${index + 1}.jpg`}</div>
                  <div>{formatFileSize(images[key]?.file_size)}</div>
                </div>
                <button
                  onClick={() => fileInputRefs[key as keyof typeof fileInputRefs].current?.click()}
                  disabled={uploading === key}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {uploading === key ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
                <input
                  ref={fileInputRefs[key as keyof typeof fileInputRefs]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(key, e)}
                  className="hidden"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Recommended: 800x600px, max 5MB each
          </p>
        </div>

        {/* Logo, Favicon & OG Image */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Branding Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo */}
            <div>
              <h3 className="font-medium mb-3">Site Logo</h3>
              {images.logo?.file_url && (
                <div className="relative w-32 h-32 bg-background rounded-lg overflow-hidden mb-3 mx-auto border border-border flex items-center justify-center p-2">
                  <img
                    src={formatImageUrl(images.logo.file_url)}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center mb-3">
                <div>{images.logo?.file_name || 'logo.png'}</div>
                <div>{formatFileSize(images.logo?.file_size)}</div>
                <div className="mt-1">Recommended: 512x512px</div>
              </div>
              <button
                onClick={() => fileInputRefs.logo.current?.click()}
                disabled={uploading === 'logo'}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {uploading === 'logo' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Logo'
                )}
              </button>
              <input
                ref={fileInputRefs.logo}
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={(e) => handleFileSelect('logo', e)}
                className="hidden"
              />
            </div>

            {/* Favicon */}
            <div>
              <h3 className="font-medium mb-3">Favicon</h3>
              {images.favicon?.file_url && (
                <div className="relative w-32 h-32 bg-background rounded-lg overflow-hidden mb-3 mx-auto border border-border flex items-center justify-center p-2">
                  <img
                    src={formatImageUrl(images.favicon.file_url)}
                    alt="Favicon"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center mb-3">
                <div>{images.favicon?.file_name || 'favicon.ico'}</div>
                <div>{formatFileSize(images.favicon?.file_size)}</div>
                <div className="mt-1">Recommended: 32x32px or 64x64px (.ico, .png)</div>
              </div>
              <button
                onClick={() => fileInputRefs.favicon.current?.click()}
                disabled={uploading === 'favicon'}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {uploading === 'favicon' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Favicon'
                )}
              </button>
              <input
                ref={fileInputRefs.favicon}
                type="file"
                accept="image/x-icon,image/png,image/ico"
                onChange={(e) => handleFileSelect('favicon', e)}
                className="hidden"
              />
            </div>

            {/* OG Image */}
            <div>
              <h3 className="font-medium mb-3">Open Graph Image</h3>
              {images.og_image?.file_url && (
                <div className="relative w-full h-32 bg-background rounded-lg overflow-hidden mb-3 border border-border">
                  <img
                    src={formatImageUrl(images.og_image.file_url)}
                    alt="OG Image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center mb-3">
                <div>{images.og_image?.file_name || 'og-image.png'}</div>
                <div>{formatFileSize(images.og_image?.file_size)}</div>
                <div className="mt-1">Recommended: 1200x630px</div>
              </div>
              <button
                onClick={() => fileInputRefs.og_image.current?.click()}
                disabled={uploading === 'og_image'}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {uploading === 'og_image' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload OG Image'
                )}
              </button>
              <input
                ref={fileInputRefs.og_image}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileSelect('og_image', e)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-info shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium mb-1">Image Upload Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Supported formats: JPEG, PNG, WebP</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Images are automatically optimized on upload</li>
                <li>Changes reflect immediately on the website</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
