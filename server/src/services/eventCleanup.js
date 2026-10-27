const Event = require('../models/Event.js');
const Response = require('../models/Response.js');

const cleanupPastEvents = async (now = new Date()) => {
    const pastEvents = await Event.find({ date: { $lte: now } })
        .select('_id')
        .lean();
    const eventIds = pastEvents.map(({ _id }) => _id);

    if (eventIds.length === 0) {
        return 0;
    }

    await Response.deleteMany({ event: { $in: eventIds } });

    const result = await Event.deleteMany({
        _id: { $in: eventIds },
        date: { $lte: now }
    });

    return result.deletedCount;
};

const startEventCleanup = (intervalMs = 60 * 60 * 1000) => {
    let cleanupInProgress = false;

    const runCleanup = async () => {
        if (cleanupInProgress) {
            return;
        }

        cleanupInProgress = true;
        try {
            const deletedCount = await cleanupPastEvents();
            if (deletedCount > 0) {
                console.log(`Eventos pasados eliminados: ${deletedCount}`);
            }
        } catch (error) {
            console.error('Error al limpiar eventos pasados:', error.message);
        } finally {
            cleanupInProgress = false;
        }
    };

    void runCleanup();
    const interval = setInterval(runCleanup, intervalMs);
    interval.unref();
    return interval;
};

module.exports = { cleanupPastEvents, startEventCleanup };
