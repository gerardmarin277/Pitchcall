const assert = require('node:assert/strict');
const test = require('node:test');
const Event = require('../src/models/Event.js');
const Response = require('../src/models/Response.js');
const { cleanupPastEvents } = require('../src/services/eventCleanup.js');

test('deletes responses for past events and leaves future events untouched', async () => {
    const originalFind = Event.find;
    const originalEventDeleteMany = Event.deleteMany;
    const originalResponseDeleteMany = Response.deleteMany;
    const now = new Date('2026-10-27T12:00:00.000Z');
    const pastEventIds = ['past-event-1', 'past-event-2'];
    let responseDeleteFilter;
    let eventDeleteFilter;

    Event.find = (filter) => {
        assert.deepEqual(filter, { date: { $lte: now } });
        return {
            select: (fields) => {
                assert.equal(fields, '_id');
                return {
                    lean: async () => pastEventIds.map((_id) => ({ _id }))
                };
            }
        };
    };
    Response.deleteMany = async (filter) => {
        responseDeleteFilter = filter;
        return { deletedCount: 3 };
    };
    Event.deleteMany = async (filter) => {
        eventDeleteFilter = filter;
        return { deletedCount: pastEventIds.length };
    };

    try {
        const deletedCount = await cleanupPastEvents(now);

        assert.equal(deletedCount, 2);
        assert.deepEqual(responseDeleteFilter, { event: { $in: pastEventIds } });
        assert.deepEqual(eventDeleteFilter, {
            _id: { $in: pastEventIds },
            date: { $lte: now }
        });
    } finally {
        Event.find = originalFind;
        Event.deleteMany = originalEventDeleteMany;
        Response.deleteMany = originalResponseDeleteMany;
    }
});

test('does not delete responses when there are no past events', async () => {
    const originalFind = Event.find;
    const originalResponseDeleteMany = Response.deleteMany;
    Event.find = () => ({
        select: () => ({
            lean: async () => []
        })
    });
    Response.deleteMany = async () => {
        assert.fail('No debe borrar respuestas si no hay eventos pasados');
    };

    try {
        assert.equal(await cleanupPastEvents(new Date()), 0);
    } finally {
        Event.find = originalFind;
        Response.deleteMany = originalResponseDeleteMany;
    }
});
