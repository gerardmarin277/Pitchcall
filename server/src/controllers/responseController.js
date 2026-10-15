const Response = require('../models/Response.js');
const Event = require('../models/Event.js');


const submitResponse = async (req, res) => {
    try{
        const {eventId, status, reason} = req.body;
        const userId = req.user.userId;

        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({ message: 'Evento no encontrado.' });
        }

        let response = await Response.findOne({ event: eventId, user: userId });


        if(response) {
            response.status = status;
            response.reason = status === 'absent' ? reason : null;
            await response.save();
            return res.json({ message: 'Respuesta actualizada con éxito', response });
        }


        response = new Response({
            event: eventId,
            user: userId,
            status,
            reason: status === 'absent' ? reason : null
        });

        await response.save();
        res.status(201).json({ message: 'Respuesta registrada con éxito', response });
    } catch(error){
        res.status(500).json({ message: 'Error al registrar la respuesta', error: error.message });
    }
};



const getEventResponse = async (req, res) => {
    try{
        const { eventId } = req.params;
        const responses = await Response.find({ event: eventId }).populate('user', 'name email dorsal role');
        res.json(responses);
    } catch(error){
        res.status(500).json({ message: 'Error al obtener las respuestas', error: error.message });
    }
}


module.exports = { submitResponse, getEventResponse };