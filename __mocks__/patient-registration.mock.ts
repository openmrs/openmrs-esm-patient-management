export const mockedNameTemplate = {
  displayName: null,
  codeName: 'default',
  country: null,
  lines: [
    [
      {
        isToken: 'IS_NOT_NAME_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_NAME_TOKEN' as const,
        displayText: 'First Name',
        codeName: 'givenName' as const,
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_NAME_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_NAME_TOKEN' as const,
        displayText: 'Middle Name',
        codeName: 'middleName' as const,
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_NAME_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_NAME_TOKEN' as const,
        displayText: 'Family Name',
        codeName: 'familyName' as const,
        displaySize: '40',
      },
    ],
  ],
  lineByLineFormat: ['givenName', 'middleName', 'familyName'],
  nameMappings: {
    givenName: 'First Name',
    middleName: 'Middle Name',
    familyName: 'Family Name',
  },
  sizeMappings: {
    givenName: '40',
    middleName: '40',
    familyName: '40',
  },
  elementDefaults: {},
  elementRegex: null,
  elementRegexFormats: null,
  requiredElements: null,
};

export const mockedAddressTemplate = {
  displayName: null,
  codeName: 'default',
  country: null,
  lines: [
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN' as const,
        displayText: 'Village',
        codeName: 'cityVillage' as const,
        displaySize: '40',
      },
      {
        isToken: 'IS_NOT_ADDR_TOKEN' as const,
        displayText: ', ',
      },
      {
        isToken: 'IS_ADDR_TOKEN' as const,
        displayText: 'Commune',
        codeName: 'address1' as const,
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN' as const,
        displayText: 'District',
        codeName: 'countyDistrict' as const,
        displaySize: '40',
      },
      {
        isToken: 'IS_NOT_ADDR_TOKEN' as const,
        displayText: ', ',
      },
      {
        isToken: 'IS_ADDR_TOKEN' as const,
        displayText: 'Province',
        codeName: 'stateProvince' as const,
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN' as const,
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN' as const,
        displayText: 'Country',
        codeName: 'country' as const,
        displaySize: '40',
      },
    ],
  ],
  lineByLineFormat: ['cityVillage, address1', 'countyDistrict, stateProvince', 'country'],
  nameMappings: {
    country: 'Country',
    countyDistrict: 'District',
    address1: 'Commune',
    stateProvince: 'Province',
    cityVillage: 'Village',
  },
  sizeMappings: {
    country: '40',
    countyDistrict: '40',
    address1: '40',
    stateProvince: '40',
    cityVillage: '40',
  },
  elementDefaults: {
    country: 'កម្ពុជា (Cambodia)',
  },
  elementRegex: null,
  elementRegexFormats: null,
  requiredElements: null,
};

export const mockedOrderedFields = ['country', 'stateProvince', 'cityVillage', 'postalCode', 'address1', 'address2'];

export const mockedAddressOptions = [
  'Cambodia > Banteay Meanchey > Mongkol Borei > Banteay Neang > Ou Thum',
  'Cambodia > Battambang > Banan > Ta Kream > Andoung Neang',
  'Cambodia > Banteay Meanchey > Mongkol Borei > Banteay Neang > Phnum',
  'Cambodia > Kampong Cham > Chamkar Leu > Ta Prok > Neang Laeung',
  'Cambodia > Battambang > Thma Koul > Ta Meun > Tumneab',
  'Cambodia > Banteay Meanchey > Mongkol Borei > Banteay Neang > Banteay Neang',
  'Cambodia > Banteay Meanchey > Phnum Srok > Spean Sraeng > Mukh Chhneang',
  'Cambodia > Kampong Cham > Cheung Prey > Phdau Chum > Cham Neang',
];
