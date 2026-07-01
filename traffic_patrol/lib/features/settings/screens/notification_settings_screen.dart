import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/core/services/api_service.dart';

class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends ConsumerState<NotificationSettingsScreen> {
  bool _enabled = true;
  int _delayMinutes = 0;
  bool _loading = true;

  static const String _delayPrefKey = 'traffic_notify_delay_minutes';
  static const String _enabledPrefKey = 'traffic_notify_enabled';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _enabled = prefs.getBool(_enabledPrefKey) ?? true;
      _delayMinutes = prefs.getInt(_delayPrefKey) ?? 0;
      _loading = false;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_enabledPrefKey, _enabled);
    await prefs.setInt(_delayPrefKey, _delayMinutes);

    // Also save to server for server-side monitoring
    final officer = ref.read(currentOfficerProvider);
    if (officer != null) {
      try {
        final api = ApiService();
        await api.saveNotificationSettings(
          officer.id,
          enabled: _enabled,
          delayMinutes: _delayMinutes,
        );
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Settings saved!'),
          backgroundColor: AppColors.successGreen,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Auto Traffic Notification toggle
                Card(
                  child: SwitchListTile(
                    title: const Text(
                      'Auto Traffic Notifications',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: const Text(
                      'जब आपके area में traffic jam लगे तो automatic notification आये',
                    ),
                    value: _enabled,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.5),
                    onChanged: (val) {
                      setState(() => _enabled = val);
                      _saveSettings();
                    },
                    secondary: Icon(
                      _enabled
                          ? Icons.notifications_active
                          : Icons.notifications_off,
                      color: _enabled ? AppColors.primary : Colors.grey,
                      size: 30,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Delay setting
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.timer, color: AppColors.primary),
                            SizedBox(width: 8),
                            Text(
                              'Notification Delay',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Kitni der jam hone ke baad notification aaye?',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 16),

                        _buildDelayOption(
                          0,
                          'Turant',
                          'Jam detect hote hi notification',
                          Icons.flash_on,
                        ),
                        _buildDelayOption(
                          5,
                          '5 Minute',
                          '5 min se zyada jam ho tabhi notify kare',
                          Icons.timer,
                        ),
                        _buildDelayOption(
                          10,
                          '10 Minute',
                          '10 min se zyada jam ho tabhi notify kare',
                          Icons.timer,
                        ),
                        _buildDelayOption(
                          15,
                          '15 Minute',
                          '15 min se zyada jam ho tabhi notify kare',
                          Icons.timer_off,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Info card
                Card(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info_outline,
                                color: AppColors.primary, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Kaise kaam karta hai?',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          '1. App har 2 minute mein aapke area ka traffic check karti hai\n'
                          '2. Google Maps se real-time traffic data aata hai\n'
                          '3. Agar traffic normal se 25% se zyada slow ho toh notification\n'
                          '4. Agar 50% se zyada slow ho toh HIGH alert\n'
                          '5. Agar double time lag raha ho toh CRITICAL alert\n'
                          '6. Notification mein Navigate button se seedha jam tak pahunch sakte ho',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildDelayOption(
      int minutes, String title, String subtitle, IconData icon) {
    final isSelected = _delayMinutes == minutes;
    return InkWell(
      onTap: () {
        setState(() => _delayMinutes = minutes);
        _saveSettings();
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : Colors.grey,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: isSelected ? AppColors.primary : Colors.black87,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}
