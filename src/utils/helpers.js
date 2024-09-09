// Helper function to format the severity
export const formatSeverity = (severity) => {
    switch (severity) {
        case 'C':
            return 'CRITICAL';
        case 'H':
            return 'HIGH';
        case 'M':
            return 'MEDIUM';
        case 'L':
            return 'LOW';
        case 'I':
            return 'INFO';
        default:
            return 'UNKNOWN';
    }
};

// Helper function to get the CSS class for severity
export const getSeverityClass = (severity) => {
    switch (severity) {
        case 'C':
            return 'critical';
        case 'H':
            return 'high';
        case 'M':
            return 'medium';
        case 'L':
            return 'low';
        case 'I':
            return 'info';
        default:
            return 'unknown';
    }
};