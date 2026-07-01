import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:traffic_patrol/core/constants/app_colors.dart';
import 'package:traffic_patrol/core/constants/role_hierarchy.dart';
import 'package:traffic_patrol/core/providers/app_providers.dart';
import 'package:traffic_patrol/models/officer.dart';
import 'package:uuid/uuid.dart';

class AddOfficerScreen extends ConsumerStatefulWidget {
  final String? officerId;

  const AddOfficerScreen({super.key, this.officerId});

  @override
  ConsumerState<AddOfficerScreen> createState() =>
      _AddOfficerScreenState();
}

class _AddOfficerScreenState extends ConsumerState<AddOfficerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _badgeController = TextEditingController();
  final _stationController = TextEditingController();
  final _districtController = TextEditingController();
  final _stateController = TextEditingController(text: 'Rajasthan');
  OfficerRole _selectedRole = OfficerRole.constable;
  bool _isLoading = false;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    if (widget.officerId != null) {
      _isEditing = true;
      _loadOfficer();
    }
  }

  Future<void> _loadOfficer() async {
    setState(() => _isLoading = true);
    final firestoreService = ref.read(firestoreServiceProvider);
    final officer =
        await firestoreService.getOfficerById(widget.officerId!);
    if (officer != null && mounted) {
      _nameController.text = officer.name;
      _mobileController.text = officer.mobileNumber;
      _badgeController.text = officer.badgeNumber;
      _stationController.text = officer.station;
      _districtController.text = officer.district ?? '';
      _stateController.text = officer.state ?? 'Rajasthan';
      _selectedRole = officer.role;
    }
    setState(() => _isLoading = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _badgeController.dispose();
    _stationController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _saveOfficer() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final now = DateTime.now();
    final officer = Officer(
      id: widget.officerId ?? const Uuid().v4(),
      name: _nameController.text.trim(),
      mobileNumber: _mobileController.text.trim(),
      badgeNumber: _badgeController.text.trim(),
      role: _selectedRole,
      station: _stationController.text.trim(),
      district: _districtController.text.trim().isNotEmpty
          ? _districtController.text.trim()
          : null,
      state: _stateController.text.trim().isNotEmpty
          ? _stateController.text.trim()
          : null,
      isActive: true,
      createdAt: _isEditing ? now : now,
      updatedAt: now,
    );

    try {
      final firestoreService = ref.read(firestoreServiceProvider);
      if (_isEditing) {
        await firestoreService.updateOfficer(officer);
      } else {
        await firestoreService.addOfficer(officer);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing
                ? 'Officer updated!'
                : 'Officer added successfully!'),
            backgroundColor: AppColors.successGreen,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Officer' : 'Add Officer'),
      ),
      body: _isLoading && _isEditing
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Name
                    TextFormField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        labelText: 'Full Name',
                        hintText: 'Officer का पूरा नाम',
                        prefixIcon: const Icon(Icons.person),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.trim().isEmpty ? 'Name required' : null,
                    ),
                    const SizedBox(height: 16),

                    // Mobile
                    TextFormField(
                      controller: _mobileController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                      ],
                      decoration: InputDecoration(
                        labelText: 'Mobile Number',
                        hintText: '9876543210',
                        prefixIcon: const Icon(Icons.phone),
                        prefixText: '+91 ',
                        counterText: '',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Mobile number required';
                        }
                        if (v.trim().length != 10) {
                          return '10 digit number required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Badge Number
                    TextFormField(
                      controller: _badgeController,
                      decoration: InputDecoration(
                        labelText: 'Badge Number',
                        hintText: 'Badge/ID Number',
                        prefixIcon: const Icon(Icons.badge),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Badge number required'
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // Role Dropdown
                    DropdownButtonFormField<OfficerRole>(
                      initialValue: _selectedRole,
                      decoration: InputDecoration(
                        labelText: 'Rank / Role',
                        prefixIcon: const Icon(Icons.military_tech),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: OfficerRole.values
                          .map((role) => DropdownMenuItem(
                                value: role,
                                child: Text(
                                  '${role.shortTitle} - ${role.fullTitle}',
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ))
                          .toList(),
                      onChanged: (role) {
                        if (role != null) {
                          setState(() => _selectedRole = role);
                        }
                      },
                    ),
                    const SizedBox(height: 16),

                    // Station
                    TextFormField(
                      controller: _stationController,
                      decoration: InputDecoration(
                        labelText: 'Police Station (थाना)',
                        hintText: 'e.g., जोधवाड़ा',
                        prefixIcon: const Icon(Icons.location_city),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty
                          ? 'Station required'
                          : null,
                    ),
                    const SizedBox(height: 16),

                    // District
                    TextFormField(
                      controller: _districtController,
                      decoration: InputDecoration(
                        labelText: 'District (Optional)',
                        hintText: 'e.g., Jaipur',
                        prefixIcon: const Icon(Icons.map),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // State
                    TextFormField(
                      controller: _stateController,
                      decoration: InputDecoration(
                        labelText: 'State',
                        prefixIcon: const Icon(Icons.flag),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Save Button
                    SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: _isLoading ? null : _saveOfficer,
                        icon: _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.save, color: Colors.white),
                        label: Text(
                          _isLoading
                              ? 'Saving...'
                              : _isEditing
                                  ? 'Update Officer'
                                  : 'Add Officer',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
