"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SEOSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [seoData, setSeoData] = useState({
    site_name: "",
    site_title: "",
    site_description: "",
    site_keywords: [] as string[],
    contact_email: "",
    social_twitter: "",
    social_facebook: "",
    social_instagram: "",
    social_telegram: "",
  });

  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      if (data.success) {
        const { seo, contact, social } = data.data.settings;
        
        setSeoData({
          site_name: seo?.site_name || "",
          site_title: seo?.site_title || "",
          site_description: seo?.site_description || "",
          site_keywords: JSON.parse(seo?.site_keywords || "[]"),
          contact_email: contact?.contact_email || "",
          social_twitter: social?.social_twitter || "",
          social_facebook: social?.social_facebook || "",
          social_instagram: social?.social_instagram || "",
          social_telegram: social?.social_telegram || "",
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const updates = {
        site_name: seoData.site_name,
        site_title: seoData.site_title,
        site_description: seoData.site_description,
        site_keywords: JSON.stringify(seoData.site_keywords),
        contact_email: seoData.contact_email,
        social_twitter: seoData.social_twitter,
        social_facebook: seoData.social_facebook,
        social_instagram: seoData.social_instagram,
        social_telegram: seoData.social_telegram,
      };

      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('SEO settings saved successfully!');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.site_keywords.includes(keywordInput.trim())) {
      setSeoData({
        ...seoData,
        site_keywords: [...seoData.site_keywords, keywordInput.trim()]
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoData({
      ...seoData,
      site_keywords: seoData.site_keywords.filter(k => k !== keyword)
    });
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
        <h1 className="text-3xl font-bold text-foreground mb-2">SEO Settings</h1>
        <p className="text-muted-foreground">Manage meta tags, keywords, and social media links</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic SEO */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Basic SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={seoData.site_name}
                  onChange={(e) => setSeoData({...seoData, site_name: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tools24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input
                  type="text"
                  value={seoData.site_title}
                  onChange={(e) => setSeoData({...seoData, site_title: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tools24 - Professional Crypto Trading Platform"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoData.site_title.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={seoData.site_description}
                  onChange={(e) => setSeoData({...seoData, site_description: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Trade Bitcoin, Ethereum, and 100+ cryptocurrencies..."
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoData.site_description.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add keyword and press Enter"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoData.site_keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-danger"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <input
                type="email"
                value={seoData.contact_email}
                onChange={(e) => setSeoData({...seoData, contact_email: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="support@tools24.online"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <input
                  type="text"
                  value={seoData.social_twitter}
                  onChange={(e) => setSeoData({...seoData, social_twitter: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="@tools24trading"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <input
                  type="url"
                  value={seoData.social_facebook}
                  onChange={(e) => setSeoData({...seoData, social_facebook: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <input
                  type="url"
                  value={seoData.social_instagram}
                  onChange={(e) => setSeoData({...seoData, social_instagram: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telegram</label>
                <input
                  type="url"
                  value={seoData.social_telegram}
                  onChange={(e) => setSeoData({...seoData, social_telegram: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://t.me/..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              onClick={fetchSettings}
              className="px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Google Preview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg">
                <div className="text-primary text-sm mb-1">tools24.online</div>
                <div className="text-blue-600 text-lg mb-1 line-clamp-1">
                  {seoData.site_title || "Title preview"}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {seoData.site_description || "Description preview..."}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Keywords ({seoData.site_keywords.length})</h3>
                <div className="text-xs text-muted-foreground">
                  {seoData.site_keywords.join(", ") || "No keywords"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
