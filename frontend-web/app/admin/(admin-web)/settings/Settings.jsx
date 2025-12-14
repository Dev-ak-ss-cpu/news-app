"use client";
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Spinner,
  addToast,
} from '@heroui/react';
import { Settings as SettingsIcon, Save, Video, Clock } from 'lucide-react';
import { genericGetApi, genericPutApi } from '@/app/Helper';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    breakingNewsExpiryHours: 24,
    trendingNewsExpiryHours: 48,
    liveVideoId: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await genericGetApi("/api/settings");
      if (response.success && response.data) {
        setSettings({
          breakingNewsExpiryHours: response.data.breakingNewsExpiryHours || 24,
          trendingNewsExpiryHours: response.data.trendingNewsExpiryHours || 48,
          liveVideoId: response.data.liveVideoId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast({
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await genericPutApi("/api/settings", settings);
      if (response.success) {
        addToast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        addToast({
          title: "Error",
          description: response.message || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast({
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto py-8">
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Breaking News Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              Breaking News Expiry (Hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.breakingNewsExpiryHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  breakingNewsExpiryHours: parseInt(e.target.value) || 24,
                })
              }
              placeholder="24"
              variant="bordered"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Articles marked as breaking news will automatically become regular after this duration
            </p>
          </div>

          {/* Trending News Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              Trending News Expiry (Hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.trendingNewsExpiryHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trendingNewsExpiryHours: parseInt(e.target.value) || 48,
                })
              }
              placeholder="48"
              variant="bordered"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Articles marked as trending will automatically become regular after this duration
            </p>
          </div>

          {/* Live Video ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Video size={16} className="text-gray-500" />
              Live Video ID
            </label>
            <Input
              type="text"
              value={settings.liveVideoId}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  liveVideoId: e.target.value,
                })
              }
              placeholder="Cy2JyWkya5w"
              variant="bordered"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter YouTube video ID (e.g., from URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>)
            </p>
          </div>

          <div className="pt-4">
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              startContent={!saving && <Save size={16} />}
              className="min-w-[120px]"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
