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

const queueEntryActions = ['move', 'call', 'edit', 'transition', 'remove', 'delete', 'undo'] as const;
export type QueueEntryAction = (typeof queueEntryActions)[number];

const statusIcons = ['Group', 'InProgress'] as const;
type StatusIcon = (typeof statusIcons)[number];

// Options from https://react.carbondesignsystem.com/?path=/docs/components-tag--overview plus orange for priority tags
const priorityTagColors = [
  'red',
  'magenta',
  'purple',
  'blue',
  'teal',
  'cyan',
  'gray',
  'orange',
  'green',
  'warm-gray',
  'cool-gray',
  'high-contrast',
  'outline',
] as const;
type PriorityTagColor = (typeof priorityTagColors)[number];

const tagStyles = ['bold'] as const;
type TagStyle = (typeof tagStyles)[number];

// equal to columnTypes but without extension
export const builtInColumns = columnTypes.filter((columnType) => columnType !== 'extension');
const defaultIdentifierTypeUuid = '05a29f94-c0ed-11e2-94be-8c13b969e334'; // OpenMRS ID
const defaultPriorityUuid = 'f4620bfa-3625-4883-bd3f-84c2cce14470';
const defaultEmergencyPriorityUuid = '04f6f7e0-e3cb-4e13-a133-4479f759574e';
const defaultUrgentPriorityUuid = 'dc3492ef-24a5-4fd9-b58d-4fd2acf7071f';

export const defaultPriorityConfig: PriorityConfig[] = [
  {
    conceptUuid: defaultEmergencyPriorityUuid,
    style: null,
    color: 'red',
  },
  {
    conceptUuid: defaultPriorityUuid,
    style: null,
    color: 'green',
  },
  {
    conceptUuid: defaultUrgentPriorityUuid,
    style: null,
    color: 'orange',
  },
];

export const defaultColumnConfig: ColumnConfig = {
  actions: {
    buttons: ['call'],
    overflowMenu: ['move', 'transition', 'edit', 'remove', 'undo'],
  },
  identifierTypeUuid: defaultIdentifierTypeUuid,
  statusConfigs: [],
  visitQueueNumberAttributeUuid: null,
};

export const defaultQueueTable: TableDefinitions = {
  columns: ['patient-name', 'coming-from', 'priority', 'status', 'queue', 'wait-time', 'actions'],
  appliedTo: [{ queue: '', status: '' }],
};

export const configSchema = {
  priorityConfigs: {
    _type: Type.Array,
    _default: defaultPriorityConfig,
    _description: 'Add entries to configure the styling for specific priority tags.',
    _elements: {
      conceptUuid: {
        _type: Type.UUID,
        _description: 'The UUID of the priority concept to configure',
      },
      color: {
        _type: Type.String,
        _description:
          'The color of the tag. This is based on the "type" field of the Carbon Design System "Tag" component.',
        _validators: [validators.oneOf(priorityTagColors)],
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
  appointmentStatuses: {
    _type: Type.Array,
    _default: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
    _description: 'Configurable appointment status (status of appointments)',
    _elements: {
      _type: Type.String,
    },
  },
  biometrics: biometricsConfigSchema,
  concepts: {
    defaultPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _default: defaultPriorityUuid,
      _description: 'The UUID of the default priority for the queues eg Not urgent.',
    },
    defaultStatusConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      _description: 'The UUID of the default status for the queues eg Waiting.',
    },
    defaultTransitionStatus: {
      _type: Type.ConceptUuid,
      _default: 'ca7494ae-437f-4fd0-8aae-b88b9a2ba47d',
      _description: 'The UUID of the default status for attending a service in the queues eg In Service.',
    },
    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    diastolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    emergencyPriorityConceptUuid: {
      _type: Type.ConceptUuid,
      _default: defaultEmergencyPriorityUuid,
      _description: 'The UUID of the priority with the highest sort weight for the queues eg Emergency.',
    },
    generalPatientNoteConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      _description:
        'The UUID of the free text note field intended to capture unstructured description of the patient encounter',
    },
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    historicalObsConceptUuid: {
      _type: Type.Array,
      _default: ['161643AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      _description: 'The Uuids of the obs that are displayed on the previous visit modal',
      _elements: {
        _type: Type.ConceptUuid,
      },
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: '5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    pulseUuid: {
      _type: Type.ConceptUuid,
      _default: '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    problemListConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: '5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    visitDiagnosesConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  contactAttributeType: {
    _type: Type.UUID,
    _default: null,
    _description:
      'The UUID of the person attribute type that captures contact information such as `Next of kin contact details`',
  },
  customPatientChartUrl: {
    _type: Type.String,
    _default: '${openmrsSpaBase}/patient/${patientUuid}/chart',
    _description: `Template URL that will be used when clicking on the patient name in the queues table.
    Available arguments: patientUuid, openmrsSpaBase, openBase
    (openmrsSpaBase and openBase are available to any <ConfigurableLink>)`,
    _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
  },
  dashboardTitle: {
    _type: Type.Object,
    _default: {
      key: 'serviceQueues',
      value: 'Service queues',
    },
    _description: 'The title to be displayed on the service queues dashboard',
    key: {
      _type: Type.String,
      _description: 'The translation key of the title to be displayed on the service queues dashboard',
    },
    value: {
      _type: Type.String,
      _description: 'The translation value of the title to be displayed on the service queues dashboard',
    },
  },
  defaultIdentifierTypes: {
    _type: Type.Array,
    _default: ['05ee9cf4-7242-4a17-b4d4-00f707265c8a', 'f85081e2-b4be-4e48-b3a4-7994b69bb101'],
    _description: 'The identifier types to be displayed on all patient search result page',
    _elements: {
      _type: Type.String,
    },
  },
  defaultInitialServiceQueue: {
    _type: Type.String,
    _default: 'Outpatient Triage',
    _description: 'The name of the default service queue to be selected when the start visit form is opened',
  },
  queueTables: {
    columnDefinitions: {
      _type: Type.Array,
      _default: [],
      _description:
        "Custom columns for queue tables can be defined here. These columns will be referenced by their `id` in the `tableDefinitions` columns configuration. If the provided `id` matches a built-in column, the custom configuration will override the built-in column's configuration.",
      _elements: {
        id: {
          _type: Type.String,
          _description: 'The unique identifier for the column you are defining',
        },
        columnType: {
          _type: Type.String,
          _default: '',
          _description: 'The type of column, if different from the ID',
          _validators: [validators.oneOf(columnTypes)],
        },
        header: {
          _type: Type.String,
          _default: '',
          _description:
            'The header text for the column. Will be translated if it is a valid translation key. If not provided, the header will be based on the columnType.',
        },
        config: {
          actions: {
            buttons: {
              _type: Type.Array,
              _default: ['call'],
              _description:
                'For columnType "actions". Configures the buttons to display in the action cell. It is recommended to only use one, and put the rest in the overflow menu. Valid actions are: ' +
                queueEntryActions.join(', '),
              _elements: {
                _type: Type.String,
                _validators: [validators.oneOf(queueEntryActions)],
              },
            },
            overflowMenu: {
              _type: Type.Array,
              _default: ['edit', 'remove', 'undo'],
              _description:
                'For columnType "actions". Configures the items to display in the overflow menu. Valid actions are: ' +
                queueEntryActions.join(', '),
              _elements: {
                _type: Type.String,
                _validators: [validators.oneOf(queueEntryActions)],
              },
            },
          },
          identifierTypeUuid: {
            _type: Type.UUID,
            _default: defaultIdentifierTypeUuid,
            _description: "For columnType 'patient-identifier'. The UUID of the identifier type to display",
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
                _default: '',
                _description: 'The icon component to display for the status',
                _validators: [validators.oneOf(statusIcons)],
              },
            },
          },
          visitQueueNumberAttributeUuid: {
            _type: Type.String,
            _default: null,
            _description:
              'The UUID of the visit attribute that contains the visit queue number. This must be set to use the queue-number column if the top-level `visitQueueNumberAttributeUuid` config element is not set.',
          },
        },
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
                !columnDfn.config.statusConfigs ||
                columnDfn.config.statusConfigs.length == 0 ||
                columnHasType(columnDfn, 'status')
              );
            },
            (columnDfn) => {
              return `Statuses can only be configured for 'status' column type. Column ${columnDfn.id} has type '${
                columnDfn.columnType ?? columnDfn.id
              }`;
            },
          ),
        ],
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
              _default: '',
              _description: 'The UUID of the queue. If not provided, applies to all queues.',
            },
            status: {
              _type: Type.String,
              _default: '',
              _description: 'The UUID of the status. If not provided, applies to all statuses.',
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
  showRecommendedVisitTypeTab: {
    _type: Type.Boolean,
    _default: false,
    _description: 'Whether start visit form should display recommended visit type tab. Requires `visitTypeResourceUrl`',
  },
  visitQueueNumberAttributeUuid: {
    _type: Type.String,
    _default: null,
    _description: 'The UUID of the visit attribute that contains the visit queue number.',
  },
  visitTypeResourceUrl: {
    _type: Type.String,
    _default: '',
    _description: 'The `visitTypeResourceUrl`',
  },
  vitals: vitalsConfigSchema,
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
  priorityConfigs: Array<PriorityConfig>;
  appointmentStatuses: Array<string>;
  biometrics: BiometricsConfigObject;
  concepts: {
    defaultPriorityConceptUuid: string;
    defaultStatusConceptUuid: string;
    defaultTransitionStatus: string;
    diastolicBloodPressureUuid: string;
    emergencyPriorityConceptUuid: string;
    generalPatientNoteConceptUuid: string;
    heightUuid: string;
    historicalObsConceptUuid: Array<string>;
    oxygenSaturationUuid: string;
    pulseUuid: string;
    problemListConceptUuid: string;
    respiratoryRateUuid: string;
    systolicBloodPressureUuid: string;
    temperatureUuid: string;
    visitDiagnosesConceptUuid: string;
    weightUuid: string;
  };
  defaultInitialServiceQueue: string;
  contactAttributeType: string;
  customPatientChartUrl: string;
  defaultIdentifierTypes: Array<string>;
  dashboardTitle: {
    key: string;
    value: string;
  };
  queueTables: TablesConfig;
  showRecommendedVisitTypeTab: boolean;
  visitQueueNumberAttributeUuid: string | null;
  visitTypeResourceUrl: string;
  vitals: VitalsConfigObject;
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
  config: ColumnConfig;
};

export interface ActionsColumnConfig {
  actions: {
    buttons: QueueEntryAction[];
    overflowMenu: QueueEntryAction[];
  };
}

export interface PatientIdentifierColumnConfig {
  identifierTypeUuid: string; // uuid of the identifier type
}

export interface PriorityConfig {
  conceptUuid: string;
  color: PriorityTagColor;
  style: TagStyle | null;
}

export interface StatusConfig {
  conceptUuid: string;
  iconComponent: StatusIcon;
}

export interface StatusColumnConfig {
  statusConfigs: StatusConfig[];
}

export interface VisitAttributeQueueNumberColumnConfig {
  visitQueueNumberAttributeUuid: string;
}

export type ColumnConfig = ActionsColumnConfig &
  PatientIdentifierColumnConfig &
  StatusColumnConfig &
  VisitAttributeQueueNumberColumnConfig;

export interface TableDefinitions {
  // Column IDs defined either in columnDefinitions or in builtInColumns
  columns: Array<string>;

  // apply the columns to tables of any of the specified queue and status
  // (if appliedTo is null, apply to all tables, including the one in the service queue app home page)
  appliedTo?: Array<{ queue: string; status: string }>;
}
