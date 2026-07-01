enum OfficerRole {
  constable(1, 'Police Constable', 'Constable'),
  headConstable(2, 'Head Constable', 'HC'),
  asi(3, 'Assistant Sub-Inspector', 'ASI'),
  si(4, 'Sub-Inspector', 'SI'),
  inspector(5, 'Inspector / SHO', 'SHO'),
  dsp(6, 'Deputy Superintendent of Police', 'DSP'),
  addlSP(7, 'Additional Superintendent of Police', 'Addl. SP'),
  sp(8, 'Superintendent of Police', 'SP'),
  dig(9, 'Deputy Inspector General', 'DIG'),
  ig(10, 'Inspector General', 'IG'),
  adgp(11, 'Additional Director General', 'ADGP'),
  dgp(12, 'Director General of Police', 'DGP');

  const OfficerRole(this.level, this.fullTitle, this.shortTitle);

  final int level;
  final String fullTitle;
  final String shortTitle;

  bool get isSenior => level >= OfficerRole.inspector.level;
  bool get isAdmin => level >= OfficerRole.sp.level;

  bool canSupervise(OfficerRole other) => level > other.level;

  static OfficerRole fromString(String value) {
    return OfficerRole.values.firstWhere(
      (role) => role.name == value,
      orElse: () => OfficerRole.constable,
    );
  }

  static OfficerRole fromLevel(int level) {
    return OfficerRole.values.firstWhere(
      (role) => role.level == level,
      orElse: () => OfficerRole.constable,
    );
  }
}
