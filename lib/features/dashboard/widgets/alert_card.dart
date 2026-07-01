import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/traffic_alert.dart';

class AlertCard extends ConsumerWidget {
  final TrafficAlert alert;
  final bool isSenior;
  final String officerId;

  const AlertCard({
    super.key,
    required this.alert,
    required this.isSenior,
    required this.officerId,
  });

  Color get _severityColor {
    switch (alert.severity) {
      case TrafficSeverity.low:
        return AppColors.slowSpeed;
      case TrafficSeverity.medium:
        return AppColors.warningOrange;
      case TrafficSeverity.high:
        return AppColors.sosRed;
      case TrafficSeverity.critical:
        return AppColors.sosRed;
    }
  }

  IconData get _severityIcon {
    switch (alert.severity) {
      case TrafficSeverity.low:
        return Icons.info;
      case TrafficSeverity.medium:
        return Icons.warning;
      case TrafficSeverity.high:
        return Icons.error;
      case TrafficSeverity.critical:
        return Icons.dangerous;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: _severityColor.withValues(alpha: 0.5)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _severityColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(_severityIcon, color: _severityColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        alert.locationName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Text(
                            alert.severity.description,
                            style: TextStyle(
                              fontSize: 13,
                              color: _severityColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 6),
                          _buildSourceBadge(),
                        ],
                      ),
                    ],
                  ),
                ),
                _buildStatusChip(),
              ],
            ),

            if (alert.description != null) ...[
              const SizedBox(height: 8),
              Text(
                alert.description!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ],

            const SizedBox(height: 8),

            // Time info row
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    'Detected: ${DateFormat('hh:mm a, dd MMM').format(alert.createdAt)}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  if (alert.status == AlertStatus.resolved && alert.resolvedAt != null) ...[
                    const SizedBox(width: 8),
                    const Icon(Icons.check_circle_outline, size: 14, color: AppColors.successGreen),
                    const SizedBox(width: 4),
                    Text(
                      'Cleared: ${DateFormat('hh:mm a').format(alert.resolvedAt!)} (${alert.resolvedAt!.difference(alert.createdAt).inMinutes} min)',
                      style: const TextStyle(fontSize: 12, color: AppColors.successGreen),
                    ),
                  ] else ...[
                    const SizedBox(width: 8),
                    const Icon(Icons.timer, size: 14, color: AppColors.sosRed),
                    const SizedBox(width: 4),
                    Text(
                      '${DateTime.now().difference(alert.createdAt).inMinutes} min ago',
                      style: const TextStyle(fontSize: 12, color: AppColors.sosRed),
                    ),
                  ],
                ],
              ),
            ),

            const Divider(height: 24),

            // Actions
            Row(
              children: [
                // Navigate button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _navigateToLocation(),
                    icon: const Icon(Icons.navigation, size: 18),
                    label: const Text('Navigate'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.infoBlue,
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Acknowledge button
                if (alert.status == AlertStatus.active)
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _acknowledgeAlert(ref),
                      icon: const Icon(Icons.check, size: 18),
                      label: const Text('Acknowledge'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.successGreen,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),

                // Delegate button (for seniors)
                if (isSenior &&
                    alert.status != AlertStatus.resolved) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          _showDelegateDialog(context, ref),
                      icon: const Icon(Icons.person_add, size: 18),
                      label: const Text('Delegate'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.warningOrange,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSourceBadge() {
    final isAuto = alert.source == AlertSource.automatic;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isAuto ? Colors.blue.shade50 : Colors.orange.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isAuto ? Colors.blue.shade200 : Colors.orange.shade200,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isAuto ? Icons.smart_toy : Icons.person,
            size: 10,
            color: isAuto ? Colors.blue.shade700 : Colors.orange.shade700,
          ),
          const SizedBox(width: 3),
          Text(
            isAuto ? 'Auto' : 'Manual',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isAuto ? Colors.blue.shade700 : Colors.orange.shade700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip() {
    Color chipColor;
    String chipText;
    switch (alert.status) {
      case AlertStatus.active:
        chipColor = AppColors.sosRed;
        chipText = 'ACTIVE';
        break;
      case AlertStatus.acknowledged:
        chipColor = AppColors.warningOrange;
        chipText = 'ACK';
        break;
      case AlertStatus.dispatched:
        chipColor = AppColors.infoBlue;
        chipText = 'DISPATCHED';
        break;
      case AlertStatus.resolved:
        chipColor = AppColors.successGreen;
        chipText = 'RESOLVED';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        chipText,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }

  Future<void> _navigateToLocation() async {
    final lat = alert.location.latitude;
    final lng = alert.location.longitude;
    final url = Uri.parse(
        'google.navigation:q=$lat,$lng&mode=d');
    final fallbackUrl = Uri.parse(
        'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _acknowledgeAlert(WidgetRef ref) async {
    final firestoreService = ref.read(firestoreServiceProvider);
    await firestoreService.acknowledgeAlert(alert.id, officerId);
  }

  void _showDelegateDialog(BuildContext context, WidgetRef ref) {
    final officersAsync = ref.read(allOfficersProvider);

    officersAsync.whenData((officers) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Delegate Alert'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: officers.length,
              itemBuilder: (context, index) {
                final o = officers[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(o.name.isNotEmpty ? o.name[0] : '?'),
                  ),
                  title: Text(o.name),
                  subtitle: Text(o.role.shortTitle),
                  onTap: () async {
                    final firestoreService =
                        ref.read(firestoreServiceProvider);
                    await firestoreService.delegateAlert(
                        alert.id, o.id);
                    if (context.mounted) Navigator.pop(context);
                  },
                );
              },
            ),
          ),
        ),
      );
    });
  }
}
