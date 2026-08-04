// ============================================================
// Gera Schema.org MedicalOrganization para cada hospital
// de uma GeoRegion que tenha endereço preenchido.
// ============================================================

import type { GeoHospital } from '../data/geo-regions';

export function hospitalSchemas(hospitals: GeoHospital[], city = 'Rio de Janeiro', state = 'RJ') {
  return hospitals
    .filter(h => h.address)
    .map(h => ({
      '@type': 'MedicalOrganization' as const,
      'name': h.name,
      ...(h.network && { 'parentOrganization': { '@type': 'Organization', 'name': h.network } }),
      'address': {
        '@type': 'PostalAddress' as const,
        'streetAddress': h.address?.split('—')[0]?.trim() || '',
        'addressLocality': h.address?.includes(',') ? h.address.split('—').pop()?.trim() || city : city,
        'addressRegion': state,
        ...(h.cep && { 'postalCode': h.cep }),
        'addressCountry': 'BR',
      },
      'medicalSpecialty': 'Emergency',
      ...(h.emergency24h && { 'openingHours': 'Mo-Su 00:00-23:59' }),
    }));
}
