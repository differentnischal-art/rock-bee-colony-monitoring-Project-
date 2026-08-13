// Safety Guidelines Generator
export const getSafetyGuidelines = (locationType, userRole) => {
    const guidelines = {
        dos: [],
        donts: []
    };

    // Location-based guidelines
    switch (locationType) {
        case 'Buildings':
            guidelines.dos.push('Keep a safe distance of at least 10 meters');
            guidelines.dos.push('Alert building residents immediately');
            guidelines.dos.push('Contact professional bee removal services');
            guidelines.donts.push('Do not attempt to remove the hive yourself');
            guidelines.donts.push('Do not use water or fire to disperse bees');
            guidelines.donts.push('Do not block the bees\' flight path');
            break;

        case 'Farm':
            guidelines.dos.push('Protect nearby crops and livestock');
            guidelines.dos.push('Consider beekeeping opportunities');
            guidelines.dos.push('Contact local beekeepers for safe relocation');
            guidelines.donts.push('Do not use pesticides near the hive');
            guidelines.donts.push('Do not disturb during peak activity hours');
            guidelines.donts.push('Do not allow children or pets near the area');
            break;

        case 'Tall Cliffs/Tree':
        case 'Bridges':
            guidelines.dos.push('Mark the area with warning signs');
            guidelines.dos.push('Contact specialized high-altitude bee removal teams');
            guidelines.dos.push('Ensure public safety by cordoning off the area');
            guidelines.donts.push('NEVER attempt removal without proper equipment');
            guidelines.donts.push('Do not climb or approach the hive');
            guidelines.donts.push('Do not throw objects at the hive');
            break;

        default:
            guidelines.dos.push('Maintain a safe distance');
            guidelines.dos.push('Call emergency services if threatened');
            guidelines.dos.push('Document location for authorities');
            guidelines.donts.push('Do not provoke or disturb the bees');
            guidelines.donts.push('Do not make sudden movements');
            guidelines.donts.push('Do not use strong perfumes or bright colors nearby');
    }

    // Role-specific additional guidelines
    switch (userRole) {
        case 'Farmer':
            guidelines.dos.push('Consider sustainable beekeeping practices');
            guidelines.dos.push('Consult with apiary experts for hive management');
            break;

        case 'General Public':
            guidelines.dos.push('Report to local authorities immediately');
            guidelines.dos.push('Warn others in the vicinity');
            break;

        case 'Authorized Person':
            guidelines.dos.push('Conduct safety assessment before action');
            guidelines.dos.push('Wear full protective gear (bee suit, gloves, veil)');
            guidelines.dos.push('Have emergency medical kit ready');
            break;

        case 'Researcher':
            guidelines.dos.push('Follow ethical research protocols');
            guidelines.dos.push('Obtain necessary permissions before sampling');
            guidelines.dos.push('Maintain detailed documentation');
            break;

        case 'Student':
            guidelines.dos.push('Observe only under supervisor guidance');
            guidelines.dos.push('Maintain minimum 15-meter observation distance');
            guidelines.donts.push('Do not approach without instructor permission');
            break;
    }

    return guidelines;
};
