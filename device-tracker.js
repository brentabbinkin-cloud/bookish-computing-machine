// Device Connection Sequence Tracker
// Monitors WiFi, Bluetooth, USB, and NFC device connections in chronological order

class DeviceTracker {
    constructor() {
        this.isMonitoring = false;
        this.events = [];
        this.devices = new Map();
        this.sequenceNumber = 0;
        this.startTime = null;
        this.connectionStartTimes = new Map();
        this.autoScroll = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.startDurationTimer();
    }

    setupEventListeners() {
        document.getElementById('startMonitor').addEventListener('click', () => this.startMonitoring());
        document.getElementById('stopMonitor').addEventListener('click', () => this.stopMonitoring());
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());
        document.getElementById('exportLog').addEventListener('click', () => this.exportLog());
        document.getElementById('autoScroll').addEventListener('click', (e) => this.toggleAutoScroll(e));
        
        // Filter listeners
        document.getElementById('connectionTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchDevice').addEventListener('input', () => this.applyFilters());
        
        // Details toggle
        document.getElementById('showDetails').addEventListener('change', () => this.toggleDetailView());
        
        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') this.closeModal();
        });

        // Listen for system connection events (simulated)
        this.setupConnectionSimulation();
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.startTime = new Date();
        this.events = [];
        this.sequenceNumber = 0;
        
        document.getElementById('startMonitor').disabled = true;
        document.getElementById('stopMonitor').disabled = false;
        document.getElementById('monitorStatus').textContent = 'Monitoring: ON';
        document.getElementById('monitorStatus').className = 'status-badge status-active';
        
        this.logEvent('Monitoring Started', 'System', 'System', 'System Start', 'Started', 'N/A', 'Monitoring session initiated');
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        document.getElementById('startMonitor').disabled = false;
        document.getElementById('stopMonitor').disabled = true;
        document.getElementById('monitorStatus').textContent = 'Monitoring: OFF';
        document.getElementById('monitorStatus').className = 'status-badge status-stopped';
        
        this.logEvent('Monitoring Stopped', 'System', 'System', 'System Stop', 'Stopped', 'N/A', 'Monitoring session ended');
    }

    /**
     * Simulate device connections for demonstration
     * In production, this would use Web Bluetooth API, WebUSB, etc.
     */
    setupConnectionSimulation() {
        // Simulate some initial devices
        const simulatedDevices = [
            { name: 'Smartphone', type: 'Bluetooth', address: 'AA:BB:CC:DD:EE:FF', signal: -45, battery: 85 },
            { name: 'Laptop WiFi', type: 'WiFi', address: '192.168.1.100', signal: -30, battery: 100 },
            { name: 'Smart Watch', type: 'Bluetooth', address: '11:22:33:44:55:66', signal: -55, battery: 45 },
        ];

        // Simulate periodic device events
        setInterval(() => {
            if (!this.isMonitoring) return;

            const randomDevice = simulatedDevices[Math.floor(Math.random() * simulatedDevices.length)];
            const eventTypes = ['Connected', 'Data Sync', 'Ping', 'Reconnected'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            // 90% chance of normal event, 10% chance of disconnection
            const isDisconnect = Math.random() > 0.9;
            
            if (isDisconnect) {
                this.recordDeviceEvent(randomDevice.name, randomDevice.type, randomDevice.address, 'Disconnected', -1, randomDevice.battery);
            } else {
                this.recordDeviceEvent(randomDevice.name, randomDevice.type, randomDevice.address, eventType, randomDevice.signal, randomDevice.battery);
            }
        }, 5000); // Simulate event every 5 seconds

        // Manual device connection trigger (for testing)
        document.addEventListener('keypress', (e) => {
            if (e.key === 'd' && this.isMonitoring) {
                // Press 'd' to simulate a new device connection
                this.recordDeviceEvent(
                    `Device ${Math.floor(Math.random() * 1000)}`,
                    ['WiFi', 'Bluetooth', 'USB'][Math.floor(Math.random() * 3)],
                    this.generateAddress(),
                    'Connected',
                    -40 - Math.floor(Math.random() * 50),
                    Math.floor(Math.random() * 100)
                );
            }
        });
    }

    generateAddress() {
        const parts = [];
        for (let i = 0; i < 6; i++) {
            parts.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
        }
        return parts.join(':');
    }

    /**
     * Record a device connection event
     */
    recordDeviceEvent(deviceName, type, address, status, signal, battery) {
        if (!this.isMonitoring) return;

        this.sequenceNumber++;
        const timestamp = new Date();
        const duration = this.getDeviceConnectionDuration(address, status);

        // Update device map
        const deviceKey = `${type}:${address}`;
        if (status === 'Connected') {
            this.devices.set(deviceKey, {
                name: deviceName,
                type,
                address,
                status: 'Connected',
                lastSeen: timestamp,
                signal,
                battery,
                connectionStart: timestamp
            });
            this.connectionStartTimes.set(deviceKey, timestamp);
        } else if (status === 'Disconnected') {
            const device = this.devices.get(deviceKey);
            if (device) {
                device.status = 'Disconnected';
                device.lastSeen = timestamp;
            }
            this.connectionStartTimes.delete(deviceKey);
        }

        // Create event object
        const event = {
            sequence: this.sequenceNumber,
            timestamp,
            deviceName,
            type,
            address,
            status,
            signal,
            battery,
            duration,
            details: this.getEventDetails(deviceName, type, status)
        };

        this.events.push(event);
        this.updateUI();
        this.saveData();
    }

    getDeviceConnectionDuration(address, currentStatus) {
        const deviceKey = `Bluetooth:${address}`;
        const startTime = this.connectionStartTimes.get(deviceKey);
        
        if (!startTime) return 'N/A';
        
        if (currentStatus === 'Disconnected') {
            const duration = new Date() - startTime;
            return this.formatDuration(duration);
        }
        
        return 'Active';
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    getEventDetails(deviceName, type, status) {
        const details = {
            'Connected': `Device ${deviceName} connected via ${type}`,
            'Disconnected': `Device ${deviceName} disconnected from ${type}`,
            'Data Sync': `Data synchronization with ${deviceName}`,
            'Ping': `Heartbeat signal from ${deviceName}`,
            'Reconnected': `${deviceName} reconnected to ${type}`,
            'Error': `Connection error with ${deviceName}`,
            'Pairing': `New device ${deviceName} paired`,
            'System Start': 'Monitoring session initiated',
            'System Stop': 'Monitoring session terminated'
        };
        
        return details[status] || `Event: ${status}`;
    }

    /**
     * Log a general event (different from device events)
     */
    logEvent(eventName, deviceName, type, status, action, duration, details) {
        if (!this.isMonitoring && status !== 'Started' && status !== 'Stopped') return;

        this.sequenceNumber++;
        const timestamp = new Date();

        const event = {
            sequence: this.sequenceNumber,
            timestamp,
            deviceName: deviceName || 'System',
            type: type || 'System',
            address: 'N/A',
            status: action || status,
            signal: 'N/A',
            battery: 'N/A',
            duration,
            details
        };

        this.events.push(event);
        this.updateUI();
        this.saveData();
    }

    updateUI() {
        this.updateTimeline();
        this.updateEventTable();
        this.updateDeviceGrid();
        this.updateStatistics();
        this.updateDeviceCount();
    }

    updateTimeline() {
        const timeline = document.getElementById('timeline');
        
        if (this.events.length === 0) {
            timeline.innerHTML = '<div class="timeline-placeholder"><p>🔍 No connection events yet. Start monitoring to see device connections.</p></div>';
            return;
        }

        let html = '';
        this.events.forEach(event => {
            const statusClass = this.getStatusClass(event.status);
            const icon = this.getEventIcon(event.type, event.status);
            
            html += `
                <div class="timeline-event">
                    <div class="timeline-timestamp">${this.formatTime(event.timestamp)}</div>
                    <div class="timeline-event-content">
                        <div class="timeline-event-header">
                            <span class="event-icon">${icon}</span>
                            <span class="event-title">[#${event.sequence}] ${event.deviceName}</span>
                            <span class="event-badge ${statusClass}">${event.status}</span>
                        </div>
                        <div class="event-details">
                            <div class="detail-item">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">${event.type}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Address:</span>
                                <span class="detail-value">${event.address}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Duration:</span>
                                <span class="detail-value">${event.duration}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Signal:</span>
                                <span class="detail-value">${event.signal !== 'N/A' ? event.signal + ' dBm' : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Battery:</span>
                                <span class="detail-value">${event.battery !== 'N/A' ? event.battery + '%' : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        timeline.innerHTML = html;

        // Auto-scroll to bottom
        if (this.autoScroll) {
            timeline.scrollTop = timeline.scrollHeight;
        }
    }

    updateEventTable() {
        const tbody = document.getElementById('logBody');
        
        if (this.events.length === 0) {
            tbody.innerHTML = '<tr class="placeholder-row"><td colspan="9" style="text-align: center; padding: 20px;">Start monitoring to record device connections</td></tr>';
            return;
        }

        let html = '';
        this.events.forEach(event => {
            const statusClass = this.getStatusTableClass(event.status);
            html += `
                <tr>
                    <td>${this.formatTime(event.timestamp)}</td>
                    <td>#${event.sequence}</td>
                    <td>${event.deviceName}</td>
                    <td><code>${event.address}</code></td>
                    <td>${event.type}</td>
                    <td><span class="status-badge-table ${statusClass}">${event.status}</span></td>
                    <td>${event.duration}</td>
                    <td>${this.formatSignalBattery(event.signal, event.battery)}</td>
                    <td><button class="btn btn-small" onclick="tracker.showEventDetails(${this.events.indexOf(event)})">View</button></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateDeviceGrid() {
        const grid = document.getElementById('deviceGrid');
        
        if (this.devices.size === 0) {
            grid.innerHTML = '<div class="device-placeholder"><p>📱 No connected devices yet</p></div>';
            return;
        }

        let html = '';
        this.devices.forEach((device, key) => {
            const connectedClass = device.status === 'Connected' ? 'connected' : 'disconnected';
            const typeIcon = this.getTypeIcon(device.type);
            
            html += `
                <div class="device-card ${connectedClass}">
                    <div class="device-header">
                        <div class="device-name">${typeIcon} ${device.name}</div>
                        <span class="device-type-badge">${device.type}</span>
                    </div>
                    <div class="device-address">Address: ${device.address}</div>
                    <div class="device-info">
                        <div class="device-info-item">
                            <span class="device-info-label">Status:</span>
                            <span class="device-info-value">${device.status}</span>
                        </div>
                        <div class="device-info-item">
                            <span class="device-info-label">Last Seen:</span>
                            <span class="device-info-value">${this.formatTime(device.lastSeen)}</span>
                        </div>
                        ${device.signal !== -1 ? `
                            <div class="device-info-item">
                                <span class="device-info-label">Signal:</span>
                                <span class="device-info-value">${device.signal} dBm</span>
                            </div>
                        ` : ''}
                        ${device.battery !== -1 ? `
                            <div class="device-info-item">
                                <span class="device-info-label">Battery:</span>
                                <span class="device-info-value">${device.battery}%</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    updateStatistics() {
        document.getElementById('totalEvents').textContent = this.events.length;
        document.getElementById('activeDevices').textContent = Array.from(this.devices.values()).filter(d => d.status === 'Connected').length;
        
        const errors = this.events.filter(e => e.status === 'Error' || e.status === 'Disconnected').length;
        document.getElementById('failureCount').textContent = errors;
    }

    updateDeviceCount() {
        document.getElementById('deviceCount').textContent = `Devices: ${this.devices.size}`;
    }

    startDurationTimer() {
        setInterval(() => {
            if (this.startTime && this.isMonitoring) {
                const duration = new Date() - this.startTime;
                document.getElementById('duration').textContent = this.formatDuration(duration);
            }
        }, 1000);
    }

    getStatusClass(status) {
        const classMap = {
            'Connected': 'badge-connected',
            'Disconnected': 'badge-disconnected',
            'Connecting': 'badge-connecting',
            'Error': 'badge-error',
            'Data Sync': 'badge-connected',
            'Ping': 'badge-connected',
            'Reconnected': 'badge-connected'
        };
        return classMap[status] || 'badge-connected';
    }

    getStatusTableClass(status) {
        const classMap = {
            'Connected': 'status-connected',
            'Disconnected': 'status-disconnected',
            'Connecting': 'status-connecting',
            'Error': 'status-error'
        };
        return classMap[status] || 'status-connected';
    }

    getEventIcon(type, status) {
        const iconMap = {
            'Connected': '✅',
            'Disconnected': '❌',
            'Connecting': '⏳',
            'Error': '⚠️',
            'Data Sync': '🔄',
            'Ping': '📡',
            'Reconnected': '🔗'
        };
        return iconMap[status] || '📱';
    }

    getTypeIcon(type) {
        const iconMap = {
            'WiFi': '📶',
            'Bluetooth': '🔵',
            'USB': '🔌',
            'NFC': '📳',
            'System': '⚙️'
        };
        return iconMap[type] || '📱';
    }

    formatSignalBattery(signal, battery) {
        let result = '';
        if (signal !== 'N/A') result += `${signal} dBm`;
        if (battery !== 'N/A') result += `${result ? ' / ' : ''}${battery}%`;
        return result || 'N/A';
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }

    applyFilters() {
        const typeFilter = document.getElementById('connectionTypeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchQuery = document.getElementById('searchDevice').value.toLowerCase();

        const filteredEvents = this.events.filter(event => {
            const typeMatch = !typeFilter || event.type === typeFilter;
            const statusMatch = !statusFilter || event.status === statusFilter;
            const searchMatch = !searchQuery || 
                event.deviceName.toLowerCase().includes(searchQuery) ||
                event.address.toLowerCase().includes(searchQuery);
            
            return typeMatch && statusMatch && searchMatch;
        });

        this.displayFilteredEvents(filteredEvents);
    }

    displayFilteredEvents(filteredEvents) {
        const tbody = document.getElementById('logBody');
        
        if (filteredEvents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No events match the selected filters</td></tr>';
            return;
        }

        let html = '';
        filteredEvents.forEach(event => {
            const statusClass = this.getStatusTableClass(event.status);
            html += `
                <tr>
                    <td>${this.formatTime(event.timestamp)}</td>
                    <td>#${event.sequence}</td>
                    <td>${event.deviceName}</td>
                    <td><code>${event.address}</code></td>
                    <td>${event.type}</td>
                    <td><span class="status-badge-table ${statusClass}">${event.status}</span></td>
                    <td>${event.duration}</td>
                    <td>${this.formatSignalBattery(event.signal, event.battery)}</td>
                    <td><button class="btn btn-small" onclick="tracker.showEventDetails(${this.events.indexOf(event)})">View</button></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    showEventDetails(index) {
        const event = this.events[index];
        const modal = document.getElementById('detailModal');
        const modalBody = document.getElementById('modalBody');

        let html = `
            <table class="detail-table">
                <tr><td>Sequence Number:</td><td>#${event.sequence}</td></tr>
                <tr><td>Timestamp:</td><td>${event.timestamp.toLocaleString()}</td></tr>
                <tr><td>Device Name:</td><td>${event.deviceName}</td></tr>
                <tr><td>Connection Type:</td><td>${event.type}</td></tr>
                <tr><td>Device Address:</td><td><code>${event.address}</code></td></tr>
                <tr><td>Status:</td><td>${event.status}</td></tr>
                <tr><td>Signal Strength:</td><td>${event.signal !== 'N/A' ? event.signal + ' dBm' : 'N/A'}</td></tr>
                <tr><td>Battery Level:</td><td>${event.battery !== 'N/A' ? event.battery + '%' : 'N/A'}</td></tr>
                <tr><td>Connection Duration:</td><td>${event.duration}</td></tr>
                <tr><td>Details:</td><td>${event.details}</td></tr>
            </table>
        `;

        modalBody.innerHTML = html;
        modal.classList.remove('hidden');
        modal.classList.add('visible');
    }

    closeModal() {
        const modal = document.getElementById('detailModal');
        modal.classList.add('hidden');
        modal.classList.remove('visible');
    }

    toggleDetailView() {
        const showDetails = document.getElementById('showDetails').checked;
        // Toggle table visibility logic can be added here
    }

    toggleAutoScroll(e) {
        this.autoScroll = !this.autoScroll;
        e.target.textContent = `📍 Auto-Scroll: ${this.autoScroll ? 'ON' : 'OFF'}`;
    }

    clearLog() {
        if (confirm('Are you sure you want to clear all events? This cannot be undone.')) {
            this.events = [];
            this.devices.clear();
            this.sequenceNumber = 0;
            this.updateUI();
            this.saveData();
        }
    }

    exportLog() {
        const data = {
            exportDate: new Date().toISOString(),
            monitoringDuration: this.formatDuration(new Date() - this.startTime),
            totalEvents: this.events.length,
            devices: Array.from(this.devices.entries()),
            events: this.events.map(e => ({
                ...e,
                timestamp: e.timestamp.toISOString()
            }))
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `device-tracker-log-${new Date().getTime()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    saveData() {
        const data = {
            events: this.events.map(e => ({
                ...e,
                timestamp: e.timestamp.toISOString()
            })),
            devices: Array.from(this.devices.entries())
        };
        localStorage.setItem('deviceTrackerData', JSON.stringify(data));
    }

    loadStoredData() {
        const stored = localStorage.getItem('deviceTrackerData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.events = data.events.map(e => ({
                    ...e,
                    timestamp: new Date(e.timestamp)
                }));
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
    }
}

// Initialize tracker
const tracker = new DeviceTracker();
