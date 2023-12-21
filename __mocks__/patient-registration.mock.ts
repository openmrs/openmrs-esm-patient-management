export const mockedAddressTemplate = {
  displayName: null,
  codeName: 'default',
  country: null,
  lines: [
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN',
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN',
        displayText: 'Village',
        codeName: 'cityVillage',
        displaySize: '40',
      },
      {
        isToken: 'IS_NOT_ADDR_TOKEN',
        displayText: ', ',
      },
      {
        isToken: 'IS_ADDR_TOKEN',
        displayText: 'Commune',
        codeName: 'address1',
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN',
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN',
        displayText: 'District',
        codeName: 'countyDistrict',
        displaySize: '40',
      },
      {
        isToken: 'IS_NOT_ADDR_TOKEN',
        displayText: ', ',
      },
      {
        isToken: 'IS_ADDR_TOKEN',
        displayText: 'Province',
        codeName: 'stateProvince',
        displaySize: '40',
      },
    ],
    [
      {
        isToken: 'IS_NOT_ADDR_TOKEN',
        displayText: '',
      },
      {
        isToken: 'IS_ADDR_TOKEN',
        displayText: 'Country',
        codeName: 'country',
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
