// apps/worker/src/routes/whatsapp.js
const express = require('express');
const { 
    sendMessage, 
    sendOrderNotification, 
    sendStatusUpdate, 
    getQR, 
    isReady,
    getClientInfo 
} = require('../services/whatsappService');

const router = express.Router();

/**
 * GET /whatsapp/status
 * Obtenir le statut du client WhatsApp
 */
router.get('/status', async (req, res) => {
    try {
        const clientInfo = await getClientInfo();
        const qr = getQR();
        
        res.json({
            ready: isReady(),
            qr: qr,
            client: clientInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting WhatsApp status:', error);
        res.status(500).json({
            error: 'Failed to get WhatsApp status',
            message: error.message
        });
    }
});

/**
 * GET /whatsapp/qr
 * Obtenir le QR code pour authentification
 */
router.get('/qr', (req, res) => {
    try {
        const qr = getQR();
        
        if (!qr) {
            return res.json({
                qr: null,
                ready: isReady(),
                message: isReady() ? 'Already authenticated' : 'No QR code available'
            });
        }

        res.json({
            qr: qr,
            ready: false,
            message: 'Scan this QR code with WhatsApp'
        });
    } catch (error) {
        console.error('Error getting QR code:', error);
        res.status(500).json({
            error: 'Failed to get QR code',
            message: error.message
        });
    }
});

/**
 * POST /whatsapp/send
 * Envoyer un message WhatsApp
 */
router.post('/send', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['phone', 'message']
            });
        }

        if (!isReady()) {
            return res.status(503).json({
                error: 'WhatsApp client not ready',
                message: 'Client is not authenticated or connected'
            });
        }

        const result = await sendMessage(phone, message);
        
        if (result.success) {
            res.json({
                success: true,
                messageId: result.messageId,
                timestamp: result.timestamp,
                phone: phone
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                timestamp: result.timestamp
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            error: 'Failed to send message',
            message: error.message
        });
    }
});

/**
 * POST /whatsapp/order-notification
 * Envoyer notification de nouvelle commande
 */
router.post('/order-notification', async (req, res) => {
    try {
        const { order, phone } = req.body;

        if (!order || !phone) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['order', 'phone']
            });
        }

        if (!isReady()) {
            return res.status(503).json({
                error: 'WhatsApp client not ready'
            });
        }

        const result = await sendOrderNotification(order, phone);
        
        if (result.success) {
            res.json({
                success: true,
                messageId: result.messageId,
                timestamp: result.timestamp,
                type: 'order_notification'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                timestamp: result.timestamp
            });
        }
    } catch (error) {
        console.error('Error sending order notification:', error);
        res.status(500).json({
            error: 'Failed to send order notification',
            message: error.message
        });
    }
});

/**
 * POST /whatsapp/status-update
 * Envoyer mise à jour de statut de commande
 */
router.post('/status-update', async (req, res) => {
    try {
        const { order, phone, status } = req.body;

        if (!order || !phone || !status) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['order', 'phone', 'status']
            });
        }

        const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses: validStatuses
            });
        }

        if (!isReady()) {
            return res.status(503).json({
                error: 'WhatsApp client not ready'
            });
        }

        const result = await sendStatusUpdate(order, phone, status);
        
        if (result.success) {
            res.json({
                success: true,
                messageId: result.messageId,
                timestamp: result.timestamp,
                type: 'status_update',
                status: status
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                timestamp: result.timestamp
            });
        }
    } catch (error) {
        console.error('Error sending status update:', error);
        res.status(500).json({
            error: 'Failed to send status update',
            message: error.message
        });
    }
});

module.exports = router;