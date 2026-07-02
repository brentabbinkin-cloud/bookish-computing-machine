# Device Connection Sequence Tracker

A comprehensive monitoring application that tracks WiFi, Bluetooth, USB, and NFC device connections in chronological order. Perfect for analyzing device initialization sequences, debugging connection issues, and monitoring device activity over time.

## Features

### Real-Time Connection Monitoring
- **Multi-Protocol Support**: WiFi, Bluetooth, USB, and NFC devices
- **Chronological Sequencing**: Every connection event is numbered and timestamped
- **Live Timeline View**: Visual timeline of all connection events
- **Auto-Scroll**: Automatically scrolls to the latest events

### Device Tracking
- **Connection History**: Tracks all device connections and disconnections
- **Active Device Map**: Visual display of currently connected devices
- **Connection Duration**: Measures how long each device stays connected
- **Signal & Battery**: Monitors signal strength and battery levels

### Advanced Filtering & Search
- **Filter by Type**: WiFi, Bluetooth, USB, NFC
- **Filter by Status**: Connected, Disconnected, Connecting, Error
- **Search Functionality**: Find devices by name or address
- **Real-Time Filtering**: Results update instantly as you type

### Detailed Logging
- **Event Table**: Complete log of all connection events
- **Sequence Numbers**: Track order of all events
- **Event Details**: View comprehensive information for each event
- **Status Indicators**: Color-coded status for quick identification

### Statistics & Analytics
- **Total Events**: Count of all recorded connection events
- **Active Devices**: Number of currently connected devices
- **Failure Count**: Tracks connection errors and disconnections
- **Monitoring Duration**: How long monitoring has been active

### Data Management
- **Local Storage**: Automatically saves tracking data
- **Export to JSON**: Download complete logs for analysis
- **Clear History**: Wipe all events when needed

## Getting Started

### 1. Open the Tracker
Navigate to `device-tracker.html` in your browser.

### 2. Start Monitoring
Click the "▶️ Start Monitoring" button to begin tracking device connections.

### 3. View Events
- **Timeline View**: See a scrolling timeline of all connections
- **Event Table**: Review detailed logs in table format
- **Device Map**: See all currently connected devices

### 4. Apply Filters
Use the filter panel to search for specific:
- Connection types (WiFi, Bluetooth, etc.)
- Device statuses
- Device names or addresses

### 5. Export Data
Click "💾 Export Log" to download all tracking data as JSON for further analysis.

## Technical Details

### Files Included

#### `device-tracker.html`
Main interface featuring:
- Control panel (Start/Stop monitoring)
- Filter and search interface
- Statistics dashboard
- Connection timeline
- Event log table
- Active device grid
- Event details modal

#### `device-tracker.css`
Professional styling with:
- Dark gradient background
- Color-coded status indicators
- Responsive grid layouts
- Modal dialogs
- Timeline visualization
- Mobile-friendly design

#### `device-tracker.js`
Core functionality including:
- `DeviceTracker` class for managing connections
- Chronological event sequencing
- Device state management
- Real-time UI updates
- Data persistence with localStorage
- JSON export functionality

### How It Works

#### Event Tracking
Each device connection generates an event object containing:
```javascript
{
    sequence: 1,           // Chronological order number
    timestamp: Date,       // When the event occurred
    deviceName: "Phone",   // Name of the device
    type: "Bluetooth",     // WiFi, Bluetooth, USB, or NFC
    address: "AA:BB:CC:DD:EE:FF", // Device MAC/IP address
    status: "Connected",   // Connected, Disconnected, Error, etc.
    signal: -45,           // Signal strength in dBm
    battery: 85,           // Battery percentage
    duration: "Active",    // How long connected
    details: "..."         // Description of the event
}
```

#### Device State Management
Devices are tracked in a Map structure that updates whenever:
- A device connects
- A device disconnects
- A device's signal or battery changes
- A device is last seen

#### Chronological Sequencing
Events are automatically numbered in the order they occur, providing a complete audit trail of all device interactions.

### Simulated Device Connections

The tracker includes simulated device connections for demonstration:
- **Smartphone** (Bluetooth)
- **Laptop WiFi** (WiFi)
- **Smart Watch** (Bluetooth)

Events are generated every 5 seconds to simulate real activity.

**To manually trigger a test event**, press the 'd' key while monitoring is active.

## Usage Examples

### Track Device Initialization
Monitor the startup sequence of devices to understand the initialization process and timing.

### Debug Connection Issues
Use the timeline and event details to identify when and why connections fail.

### Analyze Device Behavior
Review the complete history of device activity to understand patterns and anomalies.

### Export for Analysis
Download the complete log and analyze it with other tools or systems.

## Filtering & Search

### Filter by Connection Type
Select from dropdown to show only:
- WiFi connections
- Bluetooth devices
- USB connections
- NFC interactions

### Filter by Status
Show only events with specific statuses:
- **Connected**: Device just connected
- **Disconnected**: Device just disconnected
- **Connecting**: Connection in progress
- **Error**: Connection failed

### Search Devices
Type into the search box to find:
- Device names (e.g., "iPhone", "Galaxy Watch")
- MAC addresses (e.g., "AA:BB:CC:DD:EE:FF")
- IP addresses (e.g., "192.168.1.100")

## Statistics Dashboard

The statistics panel provides at-a-glance information:
- **Total Events**: Complete count of all recorded events
- **Active Devices**: Devices currently connected
- **Connection Failures**: Number of failed connections
- **Monitoring Duration**: How long has the session been active

## Timeline View

The timeline provides a scrolling history of events with:
- Event timestamp
- Sequence number
- Device name and type
- Connection status
- Signal and battery information
- Auto-scroll to latest events

## Event Table

Detailed tabular view showing:
- Complete timestamp
- Sequence number for ordering
- Device name and address
- Connection type
- Current status
- Connection duration
- Signal/battery metrics
- View button for full details

## Device Map

Visual grid showing all devices:
- Current connection status (color-coded)
- Device name and type
- MAC/IP address
- Last seen time
- Signal strength
- Battery level

## Data Persistence

All tracking data is automatically saved to browser localStorage and persists across page refreshes.

## Export Format

Exported JSON includes:
```json
{
    "exportDate": "2024-01-15T10:30:00Z",
    "monitoringDuration": "2h 30m 45s",
    "totalEvents": 157,
    "devices": [...],
    "events": [...]
}
```

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses localStorage for data persistence
- Responsive design for all screen sizes

## Future Enhancements

Potential features to add:
- [ ] Real Web Bluetooth API integration
- [ ] WebUSB support for USB device tracking
- [ ] NFC detection capability
- [ ] Real WiFi network monitoring
- [ ] Connection strength graphs
- [ ] Device fingerprinting
- [ ] Anomaly detection
- [ ] Alert notifications
- [ ] Database storage
- [ ] Multi-session comparison
- [ ] Device pairing history
- [ ] Connection quality metrics
- [ ] Network bandwidth monitoring
- [ ] Geolocation tracking
- [ ] Remote logging to server

## Troubleshooting

### No events appearing
- Ensure monitoring is started (click "Start Monitoring")
- In demo mode, events are automatically generated every 5 seconds
- Press 'd' to manually trigger a test event

### Filters not working
- Check that filter values are correctly selected
- Clear search box to reset all filters
- Refresh page if filters seem stuck

### Data not persisting
- Check browser's localStorage is enabled
- Look for browser storage quota issues
- Try clearing and restarting monitoring

## Performance Notes

- Application handles 1000+ events smoothly
- Timeline auto-scrolls to latest events
- Filtering updates in real-time
- Data exported as compressed JSON

## License

Part of the bookish-computing-machine repository. See LICENSE for details.