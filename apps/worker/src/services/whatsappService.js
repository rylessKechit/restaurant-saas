// apps/worker/src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');

// Global state
global.whatsappQR = null;
global.whatsappReady = false;

// Configuration WhatsApp pour Render (TESTED & WORKING)
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
    }
});

// Event: QR Code pour authentification
client.on('qr', (qr) => {
    console.log('📱 QR Code generated - ready for scanning');
    global.whatsappQR = qr;
});

// Event: Loading state
client.on('loading_screen', (percent, message) => {
    console.log(`📱 Loading: ${percent}% - ${message}`);
});

// Event: Authenticated
client.on('authenticated', () => {
    console.log('📱 WhatsApp authenticated successfully');
    global.whatsappQR = null;
});

// Event: Client prêt
client.on('ready', () => {
    console.log('✅ WhatsApp client is ready and connected!');
    global.whatsappReady = true;
    global.whatsappQR = null;
});

// Event: Échec d'authentification
client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
    global.whatsappReady = false;
    // Restart after failure
    setTimeout(() => {
        console.log('🔄 Restarting WhatsApp client...');
        client.initialize();
    }, 5000);
});

// Event: Déconnexion
client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp disconnected:', reason);
    global.whatsappReady = false;
    global.whatsappQR = null;
    
    // Auto-reconnect
    setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        client.initialize();
    }, 3000);
});

// Event: Erreur
client.on('error', (error) => {
    console.error('❌ WhatsApp client error:', error);
});

/**
 * Envoyer un message texte WhatsApp
 */
async function sendMessage(number, message) {
    try {
        if (!global.whatsappReady) {
            throw new Error('WhatsApp client not ready');
        }

        // Format du numéro UAE (+971)
        let formattedNumber = number.replace(/\D/g, ''); // Remove non-digits
        
        // Add UAE country code if missing
        if (!formattedNumber.startsWith('971')) {
            if (formattedNumber.startsWith('0')) {
                formattedNumber = '971' + formattedNumber.substring(1);
            } else if (formattedNumber.length === 9) {
                formattedNumber = '971' + formattedNumber;
            }
        }
        
        const chatId = `${formattedNumber}@c.us`;
        
        // Vérifier si le numéro existe
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            throw new Error(`Number ${number} is not registered on WhatsApp`);
        }
        
        // Envoyer le message
        const result = await client.sendMessage(chatId, message);
        
        console.log(`📤 WhatsApp message sent to ${formattedNumber}`);
        return { 
            success: true, 
            messageId: result.id._serialized,
            timestamp: new Date().toISOString(),
            to: formattedNumber
        };
    } catch (error) {
        console.error(`❌ Error sending WhatsApp message to ${number}:`, error.message);
        return { 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Envoyer notification de commande
 */
async function sendOrderNotification(order, phone) {
    const message = `🍕 *${order.restaurant || 'Restaurant'} - Nouvelle commande!*

*Commande #${order.orderNumber}*
*Client:* ${order.customer.name}
*Téléphone:* ${order.customer.phone}
*Type:* ${order.type === 'delivery' ? '🚚 Livraison' : '🏪 À emporter'}

*Articles commandés:*
${order.items.map(item => 
    `• ${item.quantity}x ${item.product.name} - ${item.unitPrice} AED`
).join('\n')}

*Sous-total:* ${order.pricing.subtotal} AED
${order.pricing.deliveryFee > 0 ? `*Frais de livraison:* ${order.pricing.deliveryFee} AED` : ''}
*Total:* ${order.pricing.total} AED

${order.type === 'delivery' ? 
    `*Adresse de livraison:*
${order.delivery.address.street}
${order.delivery.address.city}
${order.delivery.instructions ? `*Instructions:* ${order.delivery.instructions}` : ''}` 
    : '*À emporter au restaurant*'}

${order.notes ? `*Notes spéciales:* ${order.notes}` : ''}

*Heure de commande:* ${new Date(order.createdAt).toLocaleString('fr-FR', { timeZone: 'Asia/Dubai' })}

Merci pour votre commande! 🙏`;

    return sendMessage(phone, message);
}

/**
 * Envoyer mise à jour de statut
 */
async function sendStatusUpdate(order, phone, status) {
    const statusMessages = {
        confirmed: '✅ *Commande confirmée* - Nous préparons votre commande',
        preparing: '👨‍🍳 *En préparation* - Votre commande est en cours de préparation',
        ready: '🍽️ *Commande prête* - Votre commande est prête!',
        out_for_delivery: '🚚 *En route* - Le livreur est parti avec votre commande',
        delivered: '🎉 *Livré* - Votre commande a été livrée avec succès!'
    };

    const etaInfo = {
        confirmed: order.type === 'delivery' ? '⏱️ Temps estimé: 30-45 minutes' : '⏱️ Temps estimé: 15-20 minutes',
        preparing: '⏱️ Bientôt prêt...',
        ready: order.type === 'pickup' ? '📍 Vous pouvez venir récupérer votre commande' : '🚚 Le livreur va bientôt partir',
        out_for_delivery: `⏱️ Arrivée estimée: ${order.delivery?.estimatedTime || 15} minutes`,
        delivered: '✨ Bon appétit!'
    };

    const message = `📦 *Mise à jour de votre commande*

*Commande #${order.orderNumber}*
${statusMessages[status]}

${etaInfo[status]}

${status === 'ready' && order.type === 'pickup' ? 
    `📍 *Adresse du restaurant:*
${order.restaurant?.address || 'Voir l\'application pour l\'adresse'}` : ''}

Merci de votre confiance! 🙏`;

    return sendMessage(phone, message);
}

/**
 * Initialiser le client WhatsApp
 */
function initWhatsApp() {
    try {
        console.log('🚀 Initializing WhatsApp client for Render...');
        client.initialize();
        
        // Timeout de sécurité
        setTimeout(() => {
            if (!global.whatsappReady) {
                console.log('⚠️ WhatsApp initialization taking longer than expected...');
            }
        }, 30000);
        
    } catch (error) {
        console.error('❌ Error initializing WhatsApp:', error);
    }
}

/**
 * Obtenir le QR code pour authentification
 */
function getQR() {
    return global.whatsappQR || null;
}

/**
 * Vérifier si WhatsApp est prêt
 */
function isReady() {
    return global.whatsappReady || false;
}

/**
 * Obtenir les informations du client
 */
async function getClientInfo() {
    try {
        if (!global.whatsappReady) {
            return { 
                ready: false, 
                message: 'Client not ready',
                qrAvailable: !!global.whatsappQR
            };
        }

        const info = await client.info;
        return {
            ready: true,
            user: info.wid.user,
            platform: info.platform,
            phone: info.wid._serialized,
            pushname: info.pushname,
            battery: info.battery || 'Unknown'
        };
    } catch (error) {
        console.error('❌ Error getting client info:', error);
        return { 
            ready: false, 
            error: error.message,
            qrAvailable: !!global.whatsappQR
        };
    }
}

/**
 * Redémarrer le client WhatsApp
 */
async function restartClient() {
    try {
        console.log('🔄 Restarting WhatsApp client...');
        global.whatsappReady = false;
        global.whatsappQR = null;
        
        await client.destroy();
        setTimeout(() => {
            client.initialize();
        }, 2000);
        
        return { success: true, message: 'Client restart initiated' };
    } catch (error) {
        console.error('❌ Error restarting client:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    client,
    sendMessage,
    sendOrderNotification,
    sendStatusUpdate,
    initWhatsApp,
    getQR,
    isReady,
    getClientInfo,
    restartClient
};