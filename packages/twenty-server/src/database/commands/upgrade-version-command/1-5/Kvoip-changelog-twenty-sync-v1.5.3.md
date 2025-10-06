# Changelog - twenty-sync/1.5.3 Branch

## Overview

This changelog documents all changes made in the `twenty-sync/1.5.3` branch, which includes the official Twenty v1.5.3 release plus additional synchronization and refactoring work.

This branch does not currently test Kvoip-specific features. It only contains major fixes that prevent the app from running.

Before testing changes, make sure to run the following command if you encounter native module build errors or runtime module errors:

```shell

rm -rf node_modules packages/*/node_modules
yarn install

```

## Branch Information

- **Branch**: `twenty-sync/1.5.3`
- **Upstream**: tag/`v1.5.3`
- **Date Range**: September 2024 - January 2025

---

## 🚀 Major Features & Enhancements

### 1. **ViewGroups Optimistic Rendering** (#14388)

- Implemented optimistic rendering for ViewGroups
- Enhanced UI responsiveness during view operations

### 2. **Advanced Filters Fix** (#14387)

- Fixed broken view advanced filters functionality
- Improved filter system reliability

### 3. **AI Agents Query Optimization** (#14372)

- Fixed agents query running even when AI feature flag is disabled
- Improved performance and resource usage

### 4. **Core Views Migration & Enhancement**

- Major refactoring of core views system
- Improved view migration commands and processes
- Enhanced view performance and reliability

### 5. **Field Permissions System**

- Comprehensive field-level permissions implementation
- Enhanced security and access control
- Improved permission management UI

**Field Permissions Implementation**

```typescript
// New field permissions types
export type RestrictedFieldPermissions = {
  [fieldName: string]: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
};

// Field permission check
export class FieldPermissionService {
  async checkFieldPermission(
    fieldName: string,
    operation: 'read' | 'create' | 'update' | 'delete',
    userId: string,
    objectMetadataId: string,
  ): Promise<boolean> {
    // Enhanced field-level permission checking
  }
}

// Example: UI component with field permissions
export const FieldInputWithPermissions = ({ fieldName, ...props }) => {
  const { canRead, canUpdate } = useFieldPermissions(fieldName);

  if (!canRead) return null;

  return (
    <FieldInput
      {...props}
      disabled={!canUpdate}
    />
  );
};
```

### 6. **Workflow System Improvements**

- Enhanced workflow execution and management
- Improved workflow filters and conditions
- Better workflow node handling and validation

**Workflow System Enhancements**

```typescript
// New workflow types and schemas
export type WorkflowRunStateStepInfos = {
  stepId: string;
  state: 'pending' | 'running' | 'completed' | 'failed';
  output?: Record<string, any>;
  error?: string;
};

// Example: Workflow context management
export const getWorkflowRunContext = (
  workflowRun: WorkflowRun,
  steps: WorkflowStep[],
): WorkflowRunContext => {
  // Enhanced context building with better step management
};

// Example: Workflow filter conditions
export type StepFilters = {
  [stepId: string]: {
    conditions: FilterCondition[];
    variables: Record<string, any>;
  };
};

// Example: Workflow node validation
export const canObjectBeManagedByWorkflow = (
  objectMetadata: ObjectMetadataEntity,
  workflow: Workflow,
): boolean => {
  // Enhanced object-workflow compatibility checking
};
```

### 7. **Messaging & Email Integration**

- IMAP driver integration for email synchronization
- SMTP driver for email sending
- CalDAV driver for calendar integration
- Improved Gmail and Microsoft integration

**New IMAP Driver Implementation**

```typescript
// New IMAP driver structure
packages/twenty-server/src/modules/messaging/drivers/imap/
├── providers/
│   └── imap-client.provider.ts
├── services/
│   ├── imap-fetch-by-batch.service.ts
│   ├── imap-get-message-list.service.ts
│   └── imap-get-messages.service.ts
└── utils/
    ├── parse-imap-error.util.ts
    └── extract-message-text.util.ts

// Example: IMAP client provider
@Injectable()
export class ImapClientProvider {
  async createClient(connectionConfig: ImapConnectionConfig): Promise<ImapClient> {
    // Enhanced IMAP client creation with better error handling
  }
}

// Example: SMTP driver
@Injectable()
export class SmtpClientProvider {
  async createClient(smtpConfig: SmtpConfig): Promise<SmtpClient> {
    // New SMTP client for email sending
  }
}
```

### 8. **Two-Factor Authentication (2FA)**

- Complete 2FA implementation
- Enhanced security for user accounts
- Multiple authentication strategies support

### 9. **AI Billing & Metered Pricing** (#14092)

- Improved billing metered pricing system
- Added pricing controls for AI chat usage
- Enhanced subscription management with yearly/monthly options
- New metered price selector component
- Better billing portal integration

### 10. **Message Folders Control** (#14144)

- New message folders management system
- Enhanced folder synchronization across email providers
- Improved Gmail, IMAP, and Microsoft folder handling
- Better folder organization and control
- Enhanced messaging import management

### 11. **Page Layout System (WIP)** (#14094, #14099, #14104, #14106, #14112, #14119, #14184)

- New page layout entities and resolvers
- Page layout tabs and widgets support
- Dashboard integration with page layouts
- Enhanced page customization capabilities
- New feature flag: `IS_PAGE_LAYOUT_ENABLED`

### 12. **Dashboard System (WIP)** (#14035, #14045, #14052, #13984)

- New graph chart components (pie, bar, gauge, number)
- Enhanced dashboard widgets and iframe support
- Improved dashboard seeding and management
- Better dashboard entity structure

### 13. **Morph Relations v2 System** (#14113, #14116, #14124, #14141, #14142, #14149, #14153, #14158, #14160, #14195, #14216, #14253, #14285)

- Major morph relation system refactoring
- New morph relation field metadata handling
- Enhanced morph relation validation and creation
- Improved morph relation deletion and management
- Better morph relation field join column handling
- New morph relation picker and multi-select components
- Enhanced morph relation schema runner
- Improved morph relation integration testing

### 14. **AI & MCP Integration (WIP)** (#14002, #14033, #14047)

- Enhanced AI metadata handling and tool support
- Improved MCP (Model Context Protocol) controller
- Better AI agent workflow integration
- Enhanced JSON-RPC handling for AI tools
- Improved AI chat functionality with better context

### 15. **Workflow System Improvements** (#13904, #13909, #13929, #13945, #14211, #14222)

- New workflow node design implementation
- Enhanced workflow diagram with proper arrows between nodes
- Improved workflow node classification and handling
- Better workflow run page stability
- Enhanced workflow step creation and management
- Improved workflow trigger handling

### 16. **Feature Flag Management** (#14157, #14164, #14094, #13767)

- Removed legacy `IS_BRANCH_ENABLED` feature flag
- Enabled CoreView feature flag on new workspaces
- Added field permissions feature flag in lab
- New page layout feature flag system
- Better feature flag management and control

### 17. **BREAKING: Authentication System Refactoring** (#13487)

- **BREAKING CHANGE**: Refactored tokens logic and enhanced email verification flow
- Replaced `getAuthTokensFromLoginToken` with `getAccessTokensFromLoginToken` for clarity
- Introduced `getWorkspaceAgnosticTokenFromEmailVerificationToken`
- Extended mutation inputs to include `locale` and `verifyEmailNextPath`
- Added email verification check and sending to various handlers
- Updated GraphQL types and hooks to reflect these changes

### 18. **Address Field Enhancements** (#13566, #13450, #13677)

- Added sub fields for address (addressNumber, street, city, state, etc.)
- Google Place Autocomplete integration for address fields
- Enhanced address field design and validation
- Improved address data model and settings

### 19. **Merge Records System** (#13436, #13537, #13658, #13678, #13944)

- Complete merge records functionality implementation
- Merge records button in RecordDetailDuplicatesSection
- Enhanced merge records UI and settings
- Improved duplicate detection and merging logic

### 20. **ClickHouse Database Integration** (#13534)

- Added chunked insert method for ClickHouse integration
- Enhanced database performance for large datasets
- Better analytics and reporting capabilities

### 21. **Custom Domain Management** (#13388, #13367)

- Refactored custom domain validation system
- Improved custom domain UX and management
- Enhanced domain verification and configuration

### 22. **Performance Optimizations** (#14209, #13761, #13549, #13527)

- Fixed view performance issues and optimizations
- Import unique value check optimization
- Improved messaging sync performance
- Fixed linter performance on frontend
- Enhanced overall application responsiveness

### 23. **CSV Import/Export Enhancements** (#13762, #13608, #13421, #12776)

- Updated CSV export documentation and user guide
- Added snackbar notifications for CSV exports
- Enhanced CSV import/export permissions system
- Enabled export of deleted records functionality
- Improved CSV handling and user experience

### 24. **Calendar & Email Integration** (#13613, #13295)

- Email and calendar events integration for opportunities
- Allow users to start calendar week on Monday
- Enhanced calendar functionality and customization
- Better email-calendar synchronization

### 25. **Advanced Permissions System** (#14306, #14290, #14287, #14024, #13882, #13874, #13767, #13755, #13698, #13646)

- Deprecated ObjectsPermissionsDeprecated system
- Restricted workflow object permissions
- Adapted field permissions to label identifier
- Rolled out comprehensive field permissions
- Fixed permission table issues and rule management
- Enhanced field permissions feature flag system
- Improved relation field permissions handling
- QA fixes for permissions system

### 26. **View System Overhaul** (#14388, #14387, #14373, #14330, #14317, #14254, #14207, #14209, #14189, #14166, #14164, #14163, #14162, #14159)

- Implemented ViewGroups optimistic rendering
- Fixed view advanced filters functionality
- Renamed prefetchViewStates to coreViewStates
- DevXP improvements on new views
- Fixed views integration tests and view creation
- Fixed views not refreshing on locale change
- Removed old view implementation (step 1)
- Core view syncing enabled by default for new workspaces
- Fixed migrate view migrate command
- Replaced view tables position columns from integer to double
- Fixed migrate view importing viewFilterGroups before viewFilters

### 29. **Internationalization (i18n)** (#14326, #14324, #14321, #14320, #14309, #14295, #14288, #14279, #14263, #14255)

- Enhanced localization support
- Improved multi-language user experience

### 30. **Email System Improvements** (#13686, #13631, #13487, #13465, #13322, #13275)

- Added user email unique constraint on workspace member
- Fixed email not verified issue while login through SSO
- Enhanced email verification flow (part of auth refactoring)
- Fixed empty emails critical bug
- Decoupled Send Email node from workflows
- Fixed phone input validation error display (red borders like email input)

### 31. **REST API & Documentation** (#14265, #13931, #13709, #13517, #13720, #13680, #13633, #13576, #13588)

- Fixed REST API tests and improved documentation
- Enhanced REST API documentation and user experience
- Improved REST API metadata handling
- Fixed API mismatch on REST metadata
- Fixed breadcrumb not appearing on API key details
- Post API keys and webhooks migration cleanup
- Fixed API key regeneration when roles feature is disabled
- Enhanced API key management and security

### 32. **Webhooks & API Keys** (#13786, #13576, #13481, #13433, #13318, #13334, #13513, #13352)

- Clarified webhook endpoint expects application/json payloads
- Moved APIs and Webhooks section out of advanced mode
- Fixed missing components.schema for webhooks
- Migrated webhook and API key REST endpoints to core schema
- Enabled roles on API keys
- Added userFriendlyMessage to handleDuplicateKeyError
- Fixed server plan reserved keyword issues
- Enhanced webhook and API key management

### 33. **Migration System v2 (WIP)** (#14166, #14068, #13988, #13977, #13955, #13960, #13899, #13647)

- Core view migration fixes
- Create related records after object creation with migration v2
- Refactored schema migration runner service discovery
- Fixed enum deletion during migration v2
- Workspace schema migration runner v2 - Fix Enums and Create TsVector
- Workspace migration v2 builder embed field metadata validation
- Workspace schema migration runner v2 implementation
- Run migrations on empty databases on docker compose
- Enhanced migration system reliability and performance

---

## 🔧 Technical Improvements

### **State Management Refactoring**

- Refactored state management across multiple components
- Improved TypeScript type safety
- Enhanced component state handling

**Dropdown Hook Refactoring**

```typescript
// Before: Single useDropdown hook
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

// After: Specialized hooks for better control
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

// Usage example
const { toggleDropdown } = useToggleDropdown();
const { closeDropdown } = useCloseDropdown();
const { openDropdown } = useOpenDropdown();
```

### **Component Refactoring**

- **Tab Components**: Refactored tab handling, renamed component: `Tab` -> `TabList`
- **Dropdown Handling**: Improved dropdown functionality across components
- **TextInput Components**: Enhanced form input handling
- **Snackbar Handling**: Improved notification system
- **Form Components**: Better form validation and handling

**AvatarChip Component Refactoring**

```typescript
// Before: Multiple separate components
import { AvatarChipLeftComponent } from './AvatarChipLeftComponent';
import { LinkAvatarChip } from './LinkAvatarChip';

// After: Unified component with better props
import { AvatarChip } from './AvatarChip';
import { MultipleAvatarChip } from './MultipleAvatarChip';

// New MultipleAvatarChip component
export type MultipleAvatarChipProps = {
  Icons: React.ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: number;
  forceEmptyText?: boolean;
  variant?: ChipVariant;
  rightComponent?: React.ReactNode;
};
```

### **Dependency Updates**

- Updated `@apollo/client` version
- Moved `sip.js` dependency to the front package
- Improved peer dependencies in `yarn.lock`
- Enhanced package management

**Package.json Updates**

```json
{
  "dependencies": {
    "@apollo/client": "^3.8.0", // Updated version
    "sip.js": "^0.21.0" // Moved sip.js to front package
  }
}
```

### **GraphQL & API Improvements**

- Updated GraphQL imports and error handling
- Improved API response handling
- Enhanced query optimization

### **Infrastructure & Tooling Updates**

- **Node.js Upgrade**: Upgraded to Node 24 (#13730)
- **NX Upgrade**: Upgraded from NX 18 to NX 21 (#13758)
- **ESLint Migration**: Migrated to ESLint 9 with new configuration (#13795, #13850)
- **NX Cloud Integration**: Set up NX workspace with cloud features (#13768)
- **Removed NX UI Terminal**: Disabled NX UI terminal for better performance (#13910)

**TypeORM Decorator Simplification**

```typescript
// Before: Required 'core' token for core entities
@InjectRepository(Workspace, 'core')
private readonly workspaceRepository: Repository<Workspace>;

@InjectRepository(User, 'core')
private readonly userRepository: Repository<User>;

@InjectRepository(AppToken, 'core')
private readonly appTokenRepository: Repository<AppToken>;

// After: No longer need 'core' token (deprecated legacy core datasource token)
@InjectRepository(Workspace)
private readonly workspaceRepository: Repository<Workspace>;

@InjectRepository(User)
private readonly userRepository: Repository<User>;

@InjectRepository(AppToken)
private readonly appTokenRepository: Repository<AppToken>;
```

---

## 🐛 Bug Fixes

### **Navigation & UI Fixes**

- Fixed navigation drawer item rendering
- Improved record detail relation section
- Enhanced UI component stability

### **Data Model Fixes**

- Fixed field metadata creation and validation
- Improved object metadata handling
- Enhanced relation field management

### **Performance Fixes**

- Optimized database queries
- Improved memory usage
- Enhanced caching mechanisms

### **Integration Fixes**

- Fixed messaging synchronization issues
- Improved calendar event handling
- Enhanced email import/export functionality

## 🔄 Migration & Database Changes

### **Workspace Migration v2**

- New workspace entitties migration system for better performance
- Enhanced metadata handling
- Improved migration reliability
- Better error recovery

---

## 📚 Documentation & User Guide

### **User Guide Updates**

- Updated user guide content
- New documentation for features
- Improved getting started guides
- Enhanced feature documentation

### **API Documentation**

- Improved REST API documentation
- Enhanced GraphQL documentation
- Better integration guides

---

## 🔒 Security Enhancements

### **Authentication & Authorization**

- Enhanced 2FA implementation (WIP)
- Improved permission system
- Better access control
- Enhanced security measures

### **Data Protection**

- Improved data validation
- Enhanced input sanitization
- Better error handling
- Improved security logging

---

## 📱 Mobile & Responsive Design

### **Mobile Improvements**

- Enhanced mobile responsiveness
- Improved touch interactions
- Better mobile navigation
- Enhanced mobile forms

---

## 🔧 Developer Experience

### **Development Tools**

- Improved development setup
- Enhanced debugging tools
- Better error reporting

### **Build System**

- Enhanced build processes
- Improved bundling
- Better asset optimization
- Enhanced development server

---

## 📊 Analytics & Monitoring

### **Monitoring Improvements**

- Enhanced error tracking
- Better performance monitoring
- Improved logging
- Enhanced analytics

---

## 🔄 Major Code Refactoring Examples

### **Component Architecture Changes**

**AvatarChip Component Refactoring**

```typescript
// Before: Multiple separate components
// packages/twenty-ui/src/components/avatar-chip/AvatarChipLeftComponent.tsx
export const AvatarChipLeftComponent = ({ ... }) => { ... };

// packages/twenty-ui/src/components/avatar-chip/LinkAvatarChip.tsx
export const LinkAvatarChip = ({ ... }) => { ... };

// After: Unified component system
// packages/twenty-ui/src/components/avatar-chip/AvatarChip.tsx
export const AvatarChip = ({
  Icon,
  avatarUrl,
  placeholder,
  onClick,
  divider
}: AvatarChipProps) => { ... };

// packages/twenty-ui/src/components/avatar-chip/MultipleAvatarChip.tsx
export const MultipleAvatarChip = ({
  Icons,
  text,
  onClick,
  variant
}: MultipleAvatarChipProps) => { ... };
```

**Dropdown Hook Refactoring**

```typescript
// Before: Single monolithic hook
// packages/twenty-front/src/modules/ui/layout/dropdown/hooks/useDropdown.ts
export const useDropdown = () => {
  // All dropdown logic in one hook
};

// After: Specialized hooks for better control
// packages/twenty-front/src/modules/ui/layout/dropdown/hooks/useToggleDropdown.ts
export const useToggleDropdown = () => {
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  // Specialized toggle logic
};

// packages/twenty-front/src/modules/ui/layout/dropdown/hooks/useCloseDropdown.ts
export const useCloseDropdown = () => {
  // Specialized close logic
};

// packages/twenty-front/src/modules/ui/layout/dropdown/hooks/useOpenDropdown.ts
export const useOpenDropdown = () => {
  // Specialized open logic
};
```

### **State Management Refactoring**

**Record Table State Management**

```typescript
// Before: useRecordTable hook
// packages/twenty-front/src/modules/object-record/record-table/hooks/useRecordTable.ts
export const useRecordTable = () => {
  // All record table logic
};

// After: Context-based approach
// packages/twenty-front/src/modules/object-record/record-table/contexts/RecordTableContext.tsx
export const RecordTableContext = createContext<RecordTableContextValue>();

// packages/twenty-front/src/modules/object-record/record-table/hooks/useRecordTableContextOrThrow.ts
export const useRecordTableContextOrThrow = () => {
  const context = useContext(RecordTableContext);
  if (!context) throw new Error('RecordTableContext not found');
  return context;
};
```

### **Backend Architecture Changes**

**Interface to Entity Migration**

```typescript
// Before: Using interfaces
// packages/twenty-server/src/engine/metadata-modules/object-metadata/interfaces/object-metadata.interface.ts
export interface ObjectMetadataInterface {
  id: string;
  nameSingular: string;
  namePlural: string;
  // ... other properties
}

// After: Using TypeORM entities
// packages/twenty-server/src/engine/metadata-modules/object-metadata/object-metadata.entity.ts
@Entity('object_metadata')
export class ObjectMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nameSingular: string;

  @Column()
  namePlural: string;
  // ... other properties with decorators
}
```

### **New Driver Implementations**

**IMAP Driver Structure**

```typescript
// New IMAP driver implementation
// packages/twenty-server/src/modules/messaging/drivers/imap/
├── providers/
│   └── imap-client.provider.ts          // IMAP client provider
├── services/
│   ├── imap-fetch-by-batch.service.ts   // Batch fetching
│   ├── imap-get-message-list.service.ts // Message list retrieval
│   ├── imap-get-messages.service.ts     // Message content
│   └── imap-handle-error.service.ts     // Error handling
└── utils/
    ├── parse-imap-error.util.ts         // Error parsing
    ├── extract-message-text.util.ts     // Text extraction
    └── parse-message-id.util.ts         // Message ID parsing

// Example: IMAP client provider
@Injectable()
export class ImapClientProvider {
  async createClient(config: ImapConnectionConfig): Promise<ImapClient> {
    return new ImapClient({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });
  }
}
```

### **Type System Improvements**

**Enhanced Type Definitions**

```typescript
// New shared types in twenty-shared
// packages/twenty-shared/src/types/RestrictedFieldPermissions.ts
export type RestrictedFieldPermissions = {
  [fieldName: string]: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
};

// packages/twenty-shared/src/types/StepFilters.ts
export type StepFilters = {
  [stepId: string]: {
    conditions: FilterCondition[];
    variables: Record<string, any>;
  };
};

// packages/twenty-shared/src/types/WorkflowRunStateStepInfos.ts
export type WorkflowRunStateStepInfos = {
  stepId: string;
  state: 'pending' | 'running' | 'completed' | 'failed';
  output?: Record<string, any>;
  error?: string;
};
```

### **TypeORM Decorator Simplification**

**Core Datasource Token Deprecation**

```typescript
// Before: Required explicit 'core' token for core entities
// packages/twenty-server/src/engine/core-modules/auth/services/auth.service.ts
export class AuthService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,

    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
  ) {}
}

// After: Simplified decorators without 'core' token
// packages/twenty-server/src/engine/core-modules/auth/services/auth.service.ts
export class AuthService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AppToken)
    private readonly appTokenRepository: Repository<AppToken>,
  ) {}
}

// This change was part of commit 533d7fe49a: "Deprecate legacy core datasource token (#14096)"
// Affected 200+ files across the codebase, simplifying TypeORM decorator usage
```

---

## 🎯 Specific Component Changes

### **Form Components**

- Enhanced form validation
- Improved input handling
- Better error display
- Enhanced user experience

### **Table Components**

- Improved table performance
- Enhanced sorting and filtering
- Better pagination
- Improved data display

### **Modal & Dialog Components**

- Enhanced modal functionality
- Improved dialog handling
- Better user interactions
- Enhanced accessibility

---

## 🔄 Breaking Changes

### **API Changes**

- Some API endpoints have been updated
- GraphQL schema changes
- Improved error responses
- Enhanced validation

### **Configuration Changes**

- Updated configuration options
- Enhanced environment variables
- Improved setup process
- Better configuration management

---

_Generated on: September 2025_
_Branch: origin/twenty-sync/1.5.3_
_Base: upstream/main_
