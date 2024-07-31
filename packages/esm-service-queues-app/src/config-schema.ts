import { Type, validator, validators } from '@openmrs/esm-framework';
import vitalsConfigSchema, { type VitalsConfigObject } from './current-visit/visit-details/vitals-config-schema';
import biometricsConfigSchema, {
  type BiometricsConfigObject,
} from './current-visit/visit-details/biometrics-config-schema';

const columnTypes = [
  'actions',
  'coming-from',
  'extension',
  'patient-age',
  'patient-identifier',
  'patient-name',
  'priority',
  'queue-number',
  'queue',
  'status',
  'visit-start-time',
  'wait-time',
] as const;
type ColumnType = (typeof columnTypes)[number];

const statusIcons = ['Group', 'InProgress'] as const;
type StatusIcon = (typeof statusIcons)[number];

// Options from https://react.carbondesignsystem.com/?path=/docs/components-tag--overview
const carbonTagColors = [
  'red',
  'magenta',
  'purple',
  'blue',
  'teal',
  'cyan',
  'gray',
  'green',
  'warm-gray',
  'cool-gray',
  'high-contrast',
  'outline',
] as const;
type CarbonTagColor = (typeof carbonTagColors)[number];

const tagStyles = ['bold'] as const;
type TagStyle = (typeof tagStyles)[number];

// equal to columnTypes but without extension
export const builtInColumns = columnTypes.filter((columnType) => columnType !== 'extension');
const defaultIdentifierTypeUuid = '05a29f94-c0ed-11e2-94be-8c13b969e334'; // OpenMRS ID

export const defaultColumnConfig: ColumnConfig = {
  identifierTypeUuid: defaultIdentifierTypeUuid,
  priorityConfigs: [],
  statusConfigs: [],
  visitQueueNumberAttributeUuid: null,
};

export const defaultQueueTable: TableDefinitions = {
  columns: ['patient-name', 'coming-from', 'priority', 'status', 'queue', 'wait-time', 'actions'],
  appliedTo: [{ queue: null, status: null }],
};

export const configSchema = {
  dashboardTitle: {
    _type: Type.Object,
    _description: 'The title to be displayed on the service queues dashboard',
    key: {
      _type: Type.String,
      _description: 'The translation key of the title to be displayed on the service queues dashboard',
    },
    value: {
      _type: Type.String,
      _description: 'The translation value of the title to be displayed on the service queues dashboard',
    },
    _default: {
      key: 'serviceQueues',
      value: 'Service queues',
    },
  },
  concepts: {
    defaultPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default priority for the queues eg Not urgent.',
      _default: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
    },
    emergencyPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the priority with the highest sort weight for the queues eg Emergency.',
      _default: '04f6f7e0-e3cb-4e13-a133-4479f759574e',
    },
    defaultStatusConceptUuid: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default status for the queues eg Waiting.',
      _default: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
    },
    defaultTransitionStatus: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default status for attending a service in the queues eg In Service.',
      _default: 'ca7494ae-437f-4fd0-8aae-b88b9a2ba47d',
    },
    defaultUrgentPriorityStatus: {
      _type: Type.ConceptUuid,
      _description: 'The UUID of the default priority for a service in the queues eg urgent.',
      _default: 'ef5718cd-d6d5-4fcf-bb82-cc4afaa90603',
    },
    defualtWaitStatusConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '167407AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    diastolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    pulseUuid: {
      _type: Type.ConceptUuid,
      _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    historicalObsConceptUuid: {
      _type: Type.Array,
      _description: 'The Uuids of the obs that are displayed on the previous visit modal',
      _default: ['161643AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    },
  },
  contactAttributeType: {
    _type: Type.UUID,
    _description:
      'The UUID of the person attribute type that captures contact information such as `Next of kin contact details`',
    _default: '',
  },
  vitals: vitalsConfigSchema,
  biometrics: biometricsConfigSchema,
  appointmentStatuses: {
    _type: Type.Array,
    _description: 'Configurable appointment status (status of appointments)',
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
  },
  defaultIdentifierTypes: {
    _type: Type.Array,
    _element: {
      _type: Type.String,
    },
    _description: 'The identifier types to be display on all patient search result page',
    _default: ['05ee9cf4-7242-4a17-b4d4-00f707265c8a', 'f85081e2-b4be-4e48-b3a4-7994b69bb101'],
  },
  showRecommendedVisitTypeTab: {
    _type: Type.Boolean,
    _description: 'Whether start visit form should display recommended visit type tab. Requires `visitTypeResourceUrl`',
    _default: false,
  },
  visitTypeResourceUrl: {
    _type: Type.String,
    _description: 'The `visitTypeResourceUrl`',
    _default: null,
  },
  customPatientChartUrl: {
    _type: Type.String,
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
    _description: `Template URL that will be used when clicking on the patient name in the queues table.
      Available arguments: patientUuid, openmrsSpaBase, openBase
      (openmrsSpaBase and openBase are available to any <ConfigurableLink>)`,
    _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
  },
  defaultFacilityUrl: {
    _type: Type.String,
    _default: '',
    _description: 'Custom URL to load default facility if it is not in the session',
  },
  visitQueueNumberAttributeUuid: {
    _type: Type.String,
    _description: 'The UUID of the visit attribute that contains the visit queue number.',
    _default: null,
  },
  queueTables: {
    columnDefinitions: {
      _type: Type.Array,
      _default: [],
      _description:
        "Custom columns for queue tables can be defined here. These columns will be referenced by their `id` in the `tableDefinitions` columns configuration. If the provided `id` matches a built-in column, the custom configuration will override the built-in column's configuration.",
      _elements: {
        _validators: [
          validator(
            (columnDfn: ColumnDefinition) =>
              Boolean(columnDfn.columnType || columnTypes.some((c) => c == columnDfn.id)),
            (columnDfn) =>
              `No columnType provided for column with ID '${
                columnDfn.id
              }', and the ID is not a valid columnType. Valid column types are: ${columnTypes.join(', ')}.`,
          ),
          validator(
            (columnDfn: ColumnDefinition) => {
              return (
                columnDfn.config.identifierTypeUuid == defaultIdentifierTypeUuid ||
                columnHasType(columnDfn, 'patient-identifier')
              );
            },
            (columnDfn) => {
              return `Identifier type can only be set for 'patient-identifier' column type. Column ${
                columnDfn.id
              } has type '${columnDfn.columnType ?? columnDfn.id}.`;
            },
          ),
          validator(
            (columnDfn: ColumnDefinition) => {
              return (
                !columnDfn.config.priorityConfigs ||
                columnDfn.config.priorityConfigs.length == 0 ||
                columnHasType(columnDfn, 'priority')
              );
            },
            (columnDfn) => {
              return `Priorities can only be configured for 'priority' column type. Column ${columnDfn.id} has type '${
                columnDfn.columnType ?? columnDfn.id
              }.`;
            },
          ),
          validator(
            (columnDfn: ColumnDefinition) => {
              return (
                !columnDfn.config.statusConfigs ||
                columnDfn.config.statusConfigs.length == 0 ||
                columnHasType(columnDfn, 'status')
              );
            },
            (columnDfn) => {
              return `Statuses can only be configured for 'status' column type. Column ${columnDfn.id} has type '${
                columnDfn.columnType ?? columnDfn.id
              }.`;
            },
          ),
        ],
        id: {
          _type: Type.String,
          _description: 'The unique identifier for the column you are defining',
        },
        columnType: {
          _type: Type.String,
          _description: 'The type of column, if different from the ID',
          _validators: [validators.oneOf(columnTypes)],
          _default: null,
        },
        header: {
          _type: Type.String,
          _description:
            'The header text for the column. Will be translated if it is a valid translation key. If not provided, the header will be based on the columnType.',
          _default: null,
        },
        headerI18nModule: {
          _type: Type.String,
          _description: 'The module to use for translation of the header.',
          _default: '@openmrs/esm-service-queues-app',
        },
        config: {
          identifierTypeUuid: {
            _type: Type.UUID,
            _description: "For columnType 'patient-identifier'. The UUID of the identifier type to display",
            _default: defaultIdentifierTypeUuid,
          },
          priorityConfigs: {
            _type: Type.Array,
            _default: [],
            _description:
              'For columnType "priority". Add entries here to configure the styling for specific priority tags.',
            _elements: {
              conceptUuid: {
                _type: Type.UUID,
                _description: 'The UUID of the priority concept to configure',
              },
              color: {
                _type: Type.String,
                _description:
                  'The color of the tag. This is based on the "type" field of the Carbon Design System "Tag" component.',
                _validators: [validators.oneOf(carbonTagColors)],
                _default: 'gray',
              },
              style: {
                _type: Type.String,
                _description: 'Style to apply to the tag',
                _validators: [validators.oneOf(tagStyles)],
                _default: null,
              },
            },
          },
          statusConfigs: {
            _type: Type.Array,
            _default: [],
            _description: 'For columnType "status". Configures the icons for each status.',
            _elements: {
              conceptUuid: {
                _type: Type.UUID,
                _description: 'The UUID of the status concept to configure',
              },
              iconComponent: {
                _type: Type.String,
                _description: 'The icon component to display for the status',
                _validators: [validators.oneOf(statusIcons)],
                _default: null,
              },
            },
            visitQueueNumberAttributeUuid: {
              _type: Type.String,
              _description:
                'The UUID of the visit attribute that contains the visit queue number. This must be set to use the queue-number column if the top-level `visitQueueNumberAttributeUuid` config element is not set.',
              _default: null,
            },
          },
        },
      },
    },
    tableDefinitions: {
      _type: Type.Array,
      _default: [defaultQueueTable],
      _elements: {
        columns: {
          _type: Type.Array,
          _elements: {
            _type: Type.String,
          },
        },
        appliedTo: {
          _type: Type.Array,
          _elements: {
            queue: {
              _type: Type.String,
              _description: 'The UUID of the queue. If not provided, applies to all queues.',
              _default: null,
            },
            status: {
              _type: Type.String,
              _description: 'The UUID of the status. If not provided, applies to all statuses.',
              _default: null,
            },
          },
        },
      },
    },
    _validators: [
      validator(
        (queueConfig: TablesConfig) => {
          const validColumnIds = [...builtInColumns, ...queueConfig.columnDefinitions.map((colDef) => colDef.id)];
          return queueConfig.tableDefinitions.every((t) => t.columns.every((c) => validColumnIds.includes(c)));
        },
        (queueConfig: TablesConfig) => {
          const validColumnIds = new Set([
            ...builtInColumns,
            ...queueConfig.columnDefinitions.map((colDef) => colDef.id),
          ]);
          return `A table definition references a column that is not defined. You can define additional columns in 'columnDefinitions'.\n\nCurrently defined column IDs are ${[
            ...validColumnIds,
          ].join(', ')}.\n\nInvalid columns: ${queueConfig.tableDefinitions
            .map((t) => t.columns.filter((c) => !validColumnIds.has(c)))
            .flat()
            .join(', ')}`;
        },
      ),
    ],
  },
  _validators: [
    validator((config: ConfigObject) => {
      const queueNumberColumnDefs = [
        ...config.queueTables.columnDefinitions.filter((colDef) => columnHasType(colDef, 'queue-number')),
        { id: 'queue-number', config: defaultColumnConfig },
      ];
      const queueNumberColumnsUsed = config.queueTables.tableDefinitions
        .map((tableDef) => tableDef.columns)
        .flat()
        .filter((col) => queueNumberColumnDefs.map((d) => d.id).includes(col));
      return Boolean(
        config.visitQueueNumberAttributeUuid ||
          queueNumberColumnsUsed.every(
            (columnId) => queueNumberColumnDefs.find((d) => d.id == columnId).config.visitQueueNumberAttributeUuid,
          ),
      );
    }, 'If a queue-number column is used in a table definition, the `visitQueueNumberAttributeUuid` must be set either at the top-level config or in the column definition.'),
  ],
};

function columnHasType(columnDef: ColumnDefinition, type: ColumnType): boolean {
  return columnDef.columnType === type || columnDef.id === type;
}

export interface ConfigObject {
  dashboardTitle: {
    key: string;
    value: string;
  };
  concepts: {
    defaultPriorityConceptUuid: string;
    defaultStatusConceptUuid: string;
    defaultUrgentPriorityStatus: string;
    defualtWaitStatusConceptUuid: string;
    defaultTransitionStatus: string;
    systolicBloodPressureUuid: string;
    diastolicBloodPressureUuid: string;
    pulseUuid: string;
    temperatureUuid: string;
    oxygenSaturationUuid: string;
    heightUuid: string;
    weightUuid: string;
    respiratoryRateUuid: string;
    emergencyPriorityConceptUuid: string;
    historicalObsConceptUuid: Array<string>;
  };
  contactAttributeType: Array<string>;
  vitals: VitalsConfigObject;
  biometrics: BiometricsConfigObject;
  appointmentStatuses: Array<string>;
  defaultIdentifierTypes: Array<string>;
  showRecommendedVisitTypeTab: boolean;
  customPatientChartUrl: string;
  visitTypeResourceUrl: string;
  visitQueueNumberAttributeUuid: string | null;
  queueTables: TablesConfig;
}

interface TablesConfig {
  columnDefinitions: ColumnDefinition[];

  /*
    A list of table definitions. A queue table (whether it is displaying entries from a
    particular queue+status combination, from a particular queue, or from multiple queues)
    will determine what columns to show based on these definitions. If multiple TableDefinitions
    have matching appliedTo criteria, the first one will be used.
  */
  tableDefinitions: TableDefinitions[];
}

export type ColumnDefinition = {
  id: string;
  columnType?: ColumnType;
  header?: string;
  headerI18nModule?: string;
  config: ColumnConfig;
};

export interface VisitAttributeQueueNumberColumnConfig {
  visitQueueNumberAttributeUuid: string;
}

export interface PatientIdentifierColumnConfig {
  identifierTypeUuid: string; // uuid of the identifier type
}
export interface PriorityConfig {
  conceptUuid: string;
  color: CarbonTagColor;
  style: TagStyle;
}

export interface PriorityColumnConfig {
  priorityConfigs: PriorityConfig[];
}

export interface StatusConfig {
  conceptUuid: string;
  iconComponent: StatusIcon;
}

export interface StatusColumnConfig {
  statusConfigs: StatusConfig[];
}

export type ColumnConfig = PatientIdentifierColumnConfig &
  PriorityColumnConfig &
  StatusColumnConfig &
  VisitAttributeQueueNumberColumnConfig;

export interface TableDefinitions {
  // Column IDs defined either in columnDefinitions or in builtInColumns
  columns: Array<string>;

  // apply the columns to tables of any of the specified queue and status
  // (if appliedTo is null, apply to all tables, including the one in the service queue app home page)
  appliedTo?: Array<{ queue?: string; status?: string }>;
}
