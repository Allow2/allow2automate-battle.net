# Battle.net Parental Controls Plugin

Enable Allow2Automate management of Battle.net parental controls to manage gaming time and access for your children.

## Description

This plugin integrates Battle.net (Blizzard Entertainment) with Allow2 parental controls, enabling parents to automate Battle.net parental control schedules based on Allow2 quotas. Uses Playwright browser automation to interact with the Battle.net parent portal, providing seamless integration between Allow2 and Battle.net's existing parental control system.

## Features

- Automated Battle.net parental control schedule updates based on Allow2 quotas
- Token-based authentication with Battle.net parent portal
- Browser automation via Playwright (headless or visible)
- Enable/disable gaming access for children
- Custom schedule management per child
- Support for multiple child profiles
- Token validation and extraction from URLs
- Secure session management

## Installation

### Via NPM

```bash
npm install @allow2/allow2automate-battle.net
```

### Via Git

```bash
git clone https://github.com/Allow2/allow2automate-battle.net.git
cd allow2automate-battle.net
npm install
npm run build
```

## Configuration

1. Install the plugin in your Allow2Automate application
2. Obtain your Battle.net parent portal XSRF token:
   - Navigate to https://account.blizzard.com/parent-portal
   - Log in with parent account
   - Copy the URL or XSRF token from the parental controls page
3. Enter the token or URL in the plugin configuration
4. Pair Battle.net children with Allow2 children
5. Enable the plugin to start automated quota management

### Required Permissions

This plugin requires the following permissions:

- **network**: To communicate with Battle.net servers and Allow2 API for quota checks and access control
- **configuration**: To read and modify plugin settings, including API credentials and child profile configurations

These permissions are necessary for the plugin to:
- Check time quotas with Allow2 services
- Enable or disable Battle.net access based on quota availability
- Update child profile settings and track gaming time

## How It Works

1. **Token Extraction**: The plugin accepts Battle.net parent portal tokens in multiple formats:
   - Full URL: `https://account.blizzard.com/parent-portal/parental-controls/12345?xsrfToken=G0ABCD...`
   - Token only: `G0ABCD1234567890...` (G0 + 64 hex characters)
   - Partial URL: `parent-portal/parental-controls/12345?xsrfToken=G0ABCD...`

2. **Browser Automation**: Uses Playwright to:
   - Authenticate with Battle.net parent portal using the XSRF token
   - Fetch child account information
   - Update parental control schedules

3. **Schedule Management**:
   - Enable gaming: Sets unlimited schedule (all time blocks enabled)
   - Disable gaming: Blocks all time slots (all time blocks set to 0)
   - Custom schedules: Supports granular time block configuration

4. **Integration**: Works alongside Allow2 quota system to enforce time limits

## Token Format

Battle.net XSRF tokens follow this pattern:
- Prefix: `G0`
- Length: 66 characters total (G0 + 64 hex digits)
- Characters: Hexadecimal (0-9, A-F)
- Example: `G0A1B2C3D4E5F6789012345678901234567890123456789012345678901234567890`

## API Usage

### Validate Token

```javascript
const TokenValidator = require('@allow2/allow2automate-battle.net/src/TokenValidator');
const validator = new TokenValidator();

const result = validator.validateInput(userInput);
if (result.success) {
  console.log('Token:', result.token);
  console.log('Child ID:', result.childId);
}
```

### Portal Client

```javascript
const ParentPortalClient = require('@allow2/allow2automate-battle.net/src/ParentPortalClient');
const client = new ParentPortalClient({ headless: true });

// Authenticate
await client.authenticate(tokenOrUrl, 'parent@email.com');

// Enable gaming
await client.enableGaming(childId);

// Disable gaming
await client.disableGaming(childId);

// Custom schedule
await client.updateSchedule(childId, {
  enabled: true,
  monday: 123456,
  tuesday: 789012,
  // ... other days
});

// Cleanup
await client.close();
```

## API Documentation

### Actions

#### `enable`
- **Name**: Enable Access
- **Description**: Enable Battle.net access for a child
- **Parameters**:
  - `childId` (string): Allow2 child identifier
  - `activityId` (string): Activity type identifier

#### `disable`
- **Name**: Disable Access
- **Description**: Disable Battle.net access for a child
- **Parameters**:
  - `childId` (string): Allow2 child identifier

#### `updateQuota`
- **Name**: Update Quota
- **Description**: Update time quota from Allow2
- **Parameters**:
  - `childId` (string): Allow2 child identifier

### Triggers

#### `quotaExceeded`
- **Name**: Quota Exceeded
- **Description**: Triggered when child's time quota is exceeded
- **Payload**:
  - `childId` (string): Child identifier
  - `timeUsed` (number): Total time used in minutes
  - `quotaLimit` (number): Quota limit in minutes

#### `quotaRenewed`
- **Name**: Quota Renewed
- **Description**: Triggered when child's quota is renewed
- **Payload**:
  - `childId` (string): Child identifier
  - `newQuota` (number): New quota amount in minutes
  - `renewalDate` (date): Date of quota renewal

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Allow2/allow2automate-battle.net.git
cd allow2automate-battle.net

# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Requirements

- Node.js 12.0 or higher
- Allow2Automate 2.0.0 or higher
- Valid Allow2 account and API credentials
- Battle.net account

## License

MIT - See [LICENSE](LICENSE) file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/Allow2/allow2automate-battle.net/issues)
- **Documentation**: [Allow2 Documentation](https://www.allow2.com/docs)
- **Community**: [Allow2 Community Forums](https://community.allow2.com)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Author

Allow2

## Keywords

allow2automate, battle.net, wow, world of warcraft, plugin, gaming, parental-controls