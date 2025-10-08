// apps/worker/src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');

// Global state
global.whatsappQR = null;
global.whatsappReady = false;

// Configuration WhatsApp text-only (sans media processing)
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
            '--disable-renderer-backgrounding',
            '--disable-background-networking',
            '--disable-ipc-flooding-protection',
            '--single-process',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-default-apps',
            '--disable-translate',
            '--disable-sync',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-domain-reliability',
            '--disable-component-extensions-with-background-pages'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
    },
    // Version web stable pour éviter les problèmes
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

// Event: QR Code pour authentification
client.on('qr', (qr) => {
    console.log('📱 QR Code received - scan with WhatsApp app');
    global.whatsappQR = qr;
});

// Event: Client prêt
client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    global.whatsappReady = true;
    global.whatsappQR = null; // Clear QR once connected
});

// Event: Échec d'authentification
client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
    global.whatsappReady = false;
});

// Event: Déconnexion
client.on('disconnected', (reason) => {
    console.log('📱 WhatsApp disconnected:', reason);
    global.whatsappReady = false;
    global.whatsappQR = null;
});

// Event: Erreur
client.on('error', (error) => {
    console.error('❌ WhatsApp error:', error);
});

/**
 * Envoyer un message texte WhatsApp
 * @param {string} number - Numéro de téléphone (avec code pays)
 * @param {string} message - Message à envoyer
 * @returns {Promise<Object>} Résultat de l'envoi
 */
async function sendMessage(number, message) {
    try {
        if (!global.whatsappReady) {
            throw new Error('WhatsApp client not ready');
        }

        // Format du numéro (ajouter @c.us si nécessaire)
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        
        // Envoyer le message
        const result = await client.sendMessage(chatId, message);
        
        console.log(`📤 WhatsApp message sent to ${number}`);
        return { 
            success: true, 
            messageId: result.id,
            timestamp: new Date().toISOString()
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
 * @param {Object} order - Données de la commande
 * @param {string} phone - Numéro de téléphone du client
 */
async function sendOrderNotification(order, phone) {
    const message = `🍕 *Nouvelle commande reçue!*

*Commande #${order.orderNumber}*
*Client:* ${order.customer.name}
*Type:* ${order.type === 'delivery' ? '🚚 Livraison' : '🏪 À emporter'}
*Total:* ${order.pricing.total} AED

*Articles:*
${order.items.map(item => `• ${item.quantity}x ${item.product.name}`).join('\n')}

${order.type === 'delivery' ? `*Adresse:* ${order.delivery.address.street}` : ''}

Merci pour votre commande! 🙏`;

    return sendMessage(phone, message);
}

/**
 * Envoyer mise à jour de statut
 * @param {Object} order - Données de la commande
 * @param {string} phone - Numéro de téléphone du client
 * @param {string} status - Nouveau statut
 */
async function sendStatusUpdate(order, phone, status) {
    const statusMessages = {
        confirmed: '✅ Votre commande a été confirmée et est en préparation',
        preparing: '👨‍🍳 Votre commande est en cours de préparation',
        ready: '🍽️ Votre commande est prête!',
        out_for_delivery: '🚚 Votre commande est en route',
        delivered: '🎉 Votre commande a été livrée avec succès!'
    };

    const message = `📦 *Mise à jour de commande*

*Commande #${order.orderNumber}*
${statusMessages[status]}

${status === 'ready' && order.type === 'pickup' ? 'Vous pouvez venir la récupérer.' : ''}
${status === 'out_for_delivery' ? `ETA: ${order.delivery.estimatedTime} minutes` : ''}

Merci! 🙏`;

    return sendMessage(phone, message);
}

/**
 * Initialiser le client WhatsApp
 */
function initWhatsApp() {
    try {
        console.log('🚀 Initializing WhatsApp client...');
        client.initialize();
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
            return { ready: false };
        }

        const info = await client.info;
        return {
            ready: true,
            user: info.wid.user,
            platform: info.platform,
            phone: info.wid._serialized
        };
    } catch (error) {
        console.error('❌ Error getting client info:', error);
        return { ready: false, error: error.message };
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
    getClientInfo
};