import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/officer.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final officersAsync = ref.watch(allOfficersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () => context.push('/admin/add-officer'),
            tooltip: 'Add Officer',
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.primary.withValues(alpha: 0.05),
            child: officersAsync.when(
              data: (officers) => Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _statItem('Total Officers', '${officers.length}',
                      Icons.people),
                  _statItem(
                      'Active',
                      '${officers.where((o) => o.isActive).length}',
                      Icons.check_circle),
                  _statItem(
                      'Inactive',
                      '${officers.where((o) => !o.isActive).length}',
                      Icons.block),
                ],
              ),
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
          ),

          // Officers List
          Expanded(
            child: officersAsync.when(
              data: (officers) {
                if (officers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.people_outline,
                            size: 64, color: AppColors.textSecondary),
                        const SizedBox(height: 16),
                        const Text(
                          'No officers registered yet',
                          style: TextStyle(
                              fontSize: 16,
                              color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () =>
                              context.push('/admin/add-officer'),
                          icon: const Icon(Icons.add,
                              color: Colors.white),
                          label: const Text('Add First Officer',
                              style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(8),
                  itemCount: officers.length,
                  itemBuilder: (context, index) =>
                      _buildOfficerTile(context, ref, officers[index]),
                );
              },
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/admin/add-officer'),
        icon: const Icon(Icons.person_add),
        label: const Text('Add Officer'),
      ),
    );
  }

  Widget _statItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildOfficerTile(
      BuildContext context, WidgetRef ref, Officer officer) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: officer.isActive
              ? AppColors.primary
              : AppColors.offline,
          child: Text(
            officer.name.isNotEmpty ? officer.name[0].toUpperCase() : '?',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          officer.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              officer.role.fullTitle,
              style: const TextStyle(fontSize: 12),
            ),
            Text(
              '${officer.station} | Badge: ${officer.badgeNumber}',
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: officer.isActive
                    ? AppColors.online
                    : AppColors.offline,
              ),
            ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              onSelected: (value) async {
                if (value == 'edit') {
                  context.push('/admin/edit-officer/${officer.id}');
                } else if (value == 'toggle') {
                  final updated = officer.copyWith(
                    isActive: !officer.isActive,
                    updatedAt: DateTime.now(),
                  );
                  await ref
                      .read(firestoreServiceProvider)
                      .updateOfficer(updated);
                } else if (value == 'delete') {
                  _showDeleteConfirmation(context, ref, officer);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                    value: 'edit', child: Text('Edit')),
                PopupMenuItem(
                  value: 'toggle',
                  child: Text(officer.isActive
                      ? 'Deactivate'
                      : 'Activate'),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Text('Delete',
                      style: TextStyle(color: AppColors.sosRed)),
                ),
              ],
            ),
          ],
        ),
        isThreeLine: true,
      ),
    );
  }

  void _showDeleteConfirmation(
      BuildContext context, WidgetRef ref, Officer officer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Officer?'),
        content: Text('${officer.name} को delete करना है?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              await ref
                  .read(firestoreServiceProvider)
                  .deleteOfficer(officer.id);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Delete',
                style: TextStyle(color: AppColors.sosRed)),
          ),
        ],
      ),
    );
  }
}
