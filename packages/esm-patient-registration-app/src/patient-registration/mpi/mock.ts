export const patientsById = {
  '2KPHYD': {
    resourceType: 'Bundle',
    id: 'urn:uuid:ca32d348-722f-4691-b8f3-73b2c27e146b',
    type: 'searchset',
    timestamp: '2022-12-01T07:03:18.234056+00:00',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'Patient?identifier=http://ohie.org/Health_ID|2KPHYD&',
      },
    ],
    entry: [
      {
        link: [
          {
            relation: '_self',
            url: 'Patient/53907812-907e-4406-bb7a-eb49dbf94d89/_history/17c22738-6d18-4c1a-bec4-0fddf36bd09a',
          },
        ],
        fullUrl: 'http://127.0.0.1:8080/fhir/Patient/53907812-907e-4406-bb7a-eb49dbf94d89',
        resource: {
          resourceType: 'Patient',
          id: '53907812-907e-4406-bb7a-eb49dbf94d89',
          meta: {
            versionId: '17c22738-6d18-4c1a-bec4-0fddf36bd09a',
            lastUpdated: '2022-11-30T13:19:57.991015+00:00',
            security: [
              {
                system: 'http://santedb.org/security/policy',
                code: '1.3.6.1.4.1.33349.3.1.5.9.2.2.3',
              },
            ],
            tag: [
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.type:M',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.resource:Patient',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$generated:true',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$alt.keys:0ffbc693-fb09-4ec1-a2f1-b7f4b6e68588',
              },
            ],
          },
          identifier: [
            {
              system: 'http://ohie.org/Health_ID',
              value: '2KPHYD',
            },
          ],
          active: true,
          name: [
            {
              use: 'official',
              family: 'John',
              given: ['Smith'],
            },
          ],
          gender: 'male',
          birthDate: '1970-11-30',
          link: [
            {
              other: {
                reference: 'Patient/0ffbc693-fb09-4ec1-a2f1-b7f4b6e68588',
              },
              type: 'seealso',
            },
          ],
        },
        search: {
          mode: 'match',
        },
      },
    ],
  },
  '2E132D': {
    resourceType: 'Bundle',
    id: 'urn:uuid:334255f7-6ca3-4968-aa5f-bc67ff4a40af',
    type: 'searchset',
    timestamp: '2022-12-01T12:39:42.000441+00:00',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'Patient?identifier=http://ohie.org/Health_ID|2E132D&',
      },
    ],
    entry: [
      {
        link: [
          {
            relation: '_self',
            url: 'Patient/48613381-8a52-4f51-ac6d-9332e1848b3f/_history/fb179fdc-9381-42f5-96d8-b6b2f6a28bfd',
          },
        ],
        fullUrl: 'http://127.0.0.1:8080/fhir/Patient/48613381-8a52-4f51-ac6d-9332e1848b3f',
        resource: {
          resourceType: 'Patient',
          id: '48613381-8a52-4f51-ac6d-9332e1848b3f',
          meta: {
            versionId: 'fb179fdc-9381-42f5-96d8-b6b2f6a28bfd',
            lastUpdated: '2022-11-25T12:42:02.130814+00:00',
            security: [
              {
                system: 'http://santedb.org/security/policy',
                code: '1.3.6.1.4.1.33349.3.1.5.9.2.2.3',
              },
            ],
            tag: [
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.type:M',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.resource:Patient',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$generated:true',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$alt.keys:3f89e52e-9473-430d-884a-693efd494fd7,010b09ef-c1a5-497c-b5de-eb72952810af',
              },
            ],
          },
          identifier: [
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E132D',
            },
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E133A',
            },
          ],
          active: true,
          name: [
            {
              use: 'usual',
              family: 'David',
              given: ['Snow'],
            },
            {
              use: 'usual',
              family: 'Davidson',
              given: ['Snow'],
            },
          ],
          gender: 'male',
          birthDate: '1980-05-10',
          address: [
            {
              use: 'home',
              country: 'Namibia',
            },
          ],
          link: [
            {
              other: {
                reference: 'Patient/9c939c40-dd0e-4e8b-9321-98c5eaccbb37',
              },
              type: 'replaces',
            },
            {
              other: {
                reference: 'Patient/3f89e52e-9473-430d-884a-693efd494fd7',
              },
              type: 'seealso',
            },
            {
              other: {
                reference: 'Patient/010b09ef-c1a5-497c-b5de-eb72952810af',
              },
              type: 'seealso',
            },
          ],
        },
        search: {
          mode: 'match',
        },
      },
    ],
  },
};

export const patientsByFreeTextSearch = {
  da: {
    resourceType: 'Bundle',
    id: 'urn:uuid:40a325ab-e646-4f24-b097-2a92b692b2e6',
    type: 'searchset',
    timestamp: '2022-12-01T12:38:18.166587+00:00',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'Patient?freetext=da&',
      },
    ],
    entry: [
      {
        link: [
          {
            relation: '_self',
            url: 'Patient/48613381-8a52-4f51-ac6d-9332e1848b3f/_history/fb179fdc-9381-42f5-96d8-b6b2f6a28bfd',
          },
        ],
        fullUrl: 'http://127.0.0.1:8080/fhir/Patient/48613381-8a52-4f51-ac6d-9332e1848b3f',
        resource: {
          resourceType: 'Patient',
          id: '48613381-8a52-4f51-ac6d-9332e1848b3f',
          meta: {
            versionId: 'fb179fdc-9381-42f5-96d8-b6b2f6a28bfd',
            lastUpdated: '2022-11-25T12:42:02.130814+00:00',
            security: [
              {
                system: 'http://santedb.org/security/policy',
                code: '1.3.6.1.4.1.33349.3.1.5.9.2.2.3',
              },
            ],
            tag: [
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.type:M',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.resource:Patient',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$generated:true',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$alt.keys:3f89e52e-9473-430d-884a-693efd494fd7,010b09ef-c1a5-497c-b5de-eb72952810af',
              },
            ],
          },
          identifier: [
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E132D',
            },
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E133A',
            },
          ],
          active: true,
          name: [
            {
              use: 'usual',
              family: 'David',
              given: ['Snow'],
            },
            {
              use: 'usual',
              family: 'Davidson',
              given: ['Snow'],
            },
          ],
          gender: 'male',
          birthDate: '1980-05-10',
          address: [
            {
              use: 'home',
              country: 'Namibia',
            },
          ],
          link: [
            {
              other: {
                reference: 'Patient/9c939c40-dd0e-4e8b-9321-98c5eaccbb37',
              },
              type: 'replaces',
            },
            {
              other: {
                reference: 'Patient/3f89e52e-9473-430d-884a-693efd494fd7',
              },
              type: 'seealso',
            },
            {
              other: {
                reference: 'Patient/010b09ef-c1a5-497c-b5de-eb72952810af',
              },
              type: 'seealso',
            },
          ],
        },
        search: {
          mode: 'match',
        },
      },
    ],
  },
  jo: {
    resourceType: 'Bundle',
    id: 'urn:uuid:51994424-a23a-4417-9059-a486ee519532',
    type: 'searchset',
    timestamp: '2022-12-01T12:43:04.827635+00:00',
    total: 2,
    link: [
      {
        relation: 'self',
        url: 'Patient?freetext=jo&',
      },
    ],
    entry: [
      {
        link: [
          {
            relation: '_self',
            url: 'Patient/c6afbf36-58c5-4af6-b415-4ced3c4ca480/_history/63bdbad8-a128-4e84-a0f5-93c0455de6ac',
          },
        ],
        fullUrl: 'http://127.0.0.1:8080/fhir/Patient/c6afbf36-58c5-4af6-b415-4ced3c4ca480',
        resource: {
          resourceType: 'Patient',
          id: 'c6afbf36-58c5-4af6-b415-4ced3c4ca480',
          meta: {
            versionId: '63bdbad8-a128-4e84-a0f5-93c0455de6ac',
            lastUpdated: '2022-11-25T12:04:55.576893+00:00',
            security: [
              {
                system: 'http://santedb.org/security/policy',
                code: '1.3.6.1.4.1.33349.3.1.5.9.2.2.3',
              },
            ],
            tag: [
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.type:M',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.resource:Patient',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$generated:true',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$alt.keys:68ae815f-eb51-4ed3-b597-36a4c5880a14',
              },
            ],
          },
          identifier: [
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E131F',
            },
          ],
          active: true,
          name: [
            {
              use: 'usual',
              family: 'Joel',
              given: ['Jones'],
            },
          ],
          gender: 'male',
          birthDate: '1989-05-10',
          address: [
            {
              use: 'home',
              country: 'Namibia',
            },
          ],
          link: [
            {
              other: {
                reference: 'Patient/68ae815f-eb51-4ed3-b597-36a4c5880a14',
              },
              type: 'seealso',
            },
          ],
        },
        search: {
          mode: 'match',
        },
      },
      {
        link: [
          {
            relation: '_self',
            url: 'Patient/1f78a9c4-abf0-4713-9600-e556a5d2cfdc/_history/4d8ceeb2-8556-4006-830e-da1683222aae',
          },
        ],
        fullUrl: 'http://127.0.0.1:8080/fhir/Patient/1f78a9c4-abf0-4713-9600-e556a5d2cfdc',
        resource: {
          resourceType: 'Patient',
          id: '1f78a9c4-abf0-4713-9600-e556a5d2cfdc',
          meta: {
            versionId: '4d8ceeb2-8556-4006-830e-da1683222aae',
            lastUpdated: '2022-11-25T11:36:32.659212+00:00',
            security: [
              {
                system: 'http://santedb.org/security/policy',
                code: '1.3.6.1.4.1.33349.3.1.5.9.2.2.3',
              },
            ],
            tag: [
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.type:M',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$mdm.resource:Patient',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$generated:true',
              },
              {
                system: 'http://santedb.org/fhir/tags',
                code: '$alt.keys:e7485b24-5bec-4a44-9eb4-8e3dd8d31e2f',
              },
            ],
          },
          identifier: [
            {
              system: 'http://ohie.org/Health_ID',
              value: '2E12XK',
            },
          ],
          active: true,
          name: [
            {
              use: 'usual',
              family: 'Jeremy',
              given: ['Kenny'],
            },
          ],
          gender: 'male',
          birthDate: '1989-05-10',
          address: [
            {
              use: 'home',
              country: 'Namibia',
            },
          ],
          link: [
            {
              other: {
                reference: 'Patient/e7485b24-5bec-4a44-9eb4-8e3dd8d31e2f',
              },
              type: 'seealso',
            },
          ],
        },
        search: {
          mode: 'match',
        },
      },
    ],
  },
};
