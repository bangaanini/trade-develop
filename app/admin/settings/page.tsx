"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

interface Settings {
  seo?: Record<string, any>;
  content?: Record<string, any>;
  contact?: Record<string, any>;
  social?: Record<string, any>;
}

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      if (data.success) {
        setSettings(data.data.settings);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('admin.site_settings')}</h1>
        <p className="text-muted-foreground">{t('admin.manage_config')}</p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SEO Settings */}
        <Link href="/admin/settings/seo">
          <div className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">{t('admin.seo_settings')}</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('admin.seo_desc')}
            </p>
            <div className="mt-4 text-sm text-primary">
              {t('admin.configure')} →
            </div>
          </div>
        </Link>

        {/* Content Editor */}
        <Link href="/admin/settings/content">
          <div className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">{t('admin.content_editor')}</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('admin.content_desc')}
            </p>
            <div className="mt-4 text-sm text-success">
              {t('admin.edit_content')} →
            </div>
          </div>
        </Link>

        {/* Image Manager */}
        <Link href="/admin/settings/images">
          <div className="p-6 bg-card border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">{t('admin.image_manager')}</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('admin.image_desc')}
            </p>
            <div className="mt-4 text-sm text-info">
              {t('admin.manage_images')} →
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">{t('admin.site_name')}</div>
          <div className="text-lg font-semibold mt-1">{settings.seo?.site_name || 'N/A'}</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">{t('admin.contact_email')}</div>
          <div className="text-lg font-semibold mt-1">{settings.contact?.contact_email || 'N/A'}</div>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">{t('admin.last_updated')}</div>
          <div className="text-lg font-semibold mt-1">Recently</div>
        </div>
      </div>
    </div>
  );
}
