# Battle.net Parental Controls Plugin

Enable Allow2Automate management of Battle.Net parental controls to manage gaming time and access for your children.

## Description

This plugin integrates Battle.net (Blizzard Entertainment) with Allow2 parental controls, enabling parents to monitor and control access to popular games like World of Warcraft, Overwatch, Diablo, and other Blizzard titles through automated quota management.

## Features

- Real-time quota checking with Allow2
- Automated enable/disable of Battle.net access
- Time quota management and tracking
- Automatic notifications when quotas are exceeded or renewed
- Seamless integration with Allow2Automate ecosystem
- Support for multiple child profiles

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
2. Configure your Allow2 API credentials
3. Link your Battle.net account
4. Set up child profiles and time quotas in Allow2

### Required Permissions

This plugin requires the following permissions:

- **network**: To communicate with Battle.net servers and Allow2 API for quota checks and access control
- **configuration**: To read and modify plugin settings, including API credentials and child profile configurations

These permissions are necessary for the plugin to:
- Check time quotas with Allow2 services
- Enable or disable Battle.net access based on quota availability
- Update child profile settings and track gaming time

## Usage

### Basic Setup

```javascript
import BattleNetPlugin from '@allow2/allow2automate-battle.net';

const plugin = new BattleNetPlugin({
  allow2Token: 'your-allow2-token',
  battleNetCredentials: {
    // Your Battle.net configuration
  }
});
```

### Enable Access

```javascript
await plugin.actions.enable({
  childId: 'child-123',
  activityId: 'gaming'
});
```

### Disable Access

```javascript
await plugin.actions.disable({
  childId: 'child-123'
});
```

### Update Quota

```javascript
await plugin.actions.updateQuota({
  childId: 'child-123'
});
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