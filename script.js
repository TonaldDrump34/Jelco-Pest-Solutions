// script.js - With multi-step lead capture + Google Apps Script submission

console.log("script.js file started executing");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired - DOM is ready");

    const toggleBtn = document.querySelector('.chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.querySelector('.chat-close');
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    if (!toggleBtn || !chatWindow || !closeBtn || !messagesContainer || !userInput || !sendBtn) {
        console.error("Some chat elements are missing - chat won't work fully");
        return;
    }

    console.log("✓ Found all chat elements");

    let isOpen = false;
    let contactState = null;          // null | 'asking_name' | 'asking_phone' | 'asking_issue'
    let contactData = { name: '', phone: '', issue: '' };

    // Toggle chat window
    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);

        if (isOpen && messagesContainer.children.length === 0) {
            addBotMessage("Hello! I'm your professional pest control consultant at Jelco Pest Solutions LLC.\nHow may I assist you today? (ants, termites, quote, schedule, contact us, etc.)");
        }
        if (isOpen) userInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        isOpen = false;
        resetContactFlow(); // Reset if they close mid-conversation
    });

    // Send on Enter or button click
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        userInput.value = '';

        if (contactState) {
            // In contact flow → process next step
            processContactStep(text);
        } else {
            // Normal mode → check if it's a contact request
            if (isContactRequest(text)) {
                startContactFlow();
            } else {
                // Regular pest response (after delay for realism)
                setTimeout(() => handlePestResponse(text), 800);
            }
        }
    }

    // ── Contact Flow Detection & Logic ───────────────────────────────────────
    function isContactRequest(msg) {
        const lower = msg.toLowerCase();
        return (
            lower.includes('contact') || lower.includes('call') || lower.includes('phone') ||
            lower.includes('schedule') || lower.includes('appointment') || lower.includes('book') ||
            lower.includes('quote') || lower.includes('price') || lower.includes('cost') ||
            lower.includes('talk to') || lower.includes('speak to') || lower.includes('someone') ||
            lower.includes('reach') || lower.includes('get in touch') || lower.includes('email')
        );
    }

    function startContactFlow() {
        contactState = 'asking_name';
        contactData = { name: '', phone: '', issue: '' };
        addBotMessage("Great! I'd be happy to connect you with our team.\n\nMay I have your **full name** please?");
    }

    function processContactStep(text) {
        if (contactState === 'asking_name') {
            contactData.name = text;
            contactState = 'asking_phone';
            addBotMessage(`Thank you, ${text.split(' ')[0]}!\n\nWhat's the **best phone number** to reach you? (include area code)`);
        }
        else if (contactState === 'asking_phone') {
            contactData.phone = text;
            contactState = 'asking_issue';
            addBotMessage("Perfect.\n\nLastly, could you briefly describe the **pest issue** you're dealing with? (type of pest, location in home, how long, etc.)");
        }
        else if (contactState === 'asking_issue') {
            contactData.issue = text;
            submitLeadToGoogleAppsScript();
        }
    }

    async function submitLeadToGoogleAppsScript() {
    addBotMessage("Thank you! Submitting your information now... Our team will reach out soon.");

    const gasUrl = "https://script.google.com/macros/s/AKfycbzC7GskpEFRz_qAy6E9i1MbaQTbuP6BTT_52h0hhwdMlw25lsAoBEuxWmEl0fvoz17O/exec";

    try {
        const response = await fetch(gasUrl, {
            method: "POST",
            mode: "no-cors",  // Keep this for now
            headers: {
                "Content-Type": "text/plain;charset=utf-8"  // ← This is the key change!
            },
            body: JSON.stringify({  // Still send JSON body
                name: contactData.name,
                phone: contactData.phone,
                issue: contactData.issue,
                source: "Website Chatbot Lead - Jelco Pest Solutions"
            })
        });

        console.log("Lead attempt sent (text/plain)");
        addBotMessage("✓ Your details have been sent successfully! We'll contact you soon.");

    } catch (err) {
        console.error("Submission error:", err);
        addBotMessage("There was a small issue sending your info. Please call us directly.");
    }

    resetContactFlow();
}

    function resetContactFlow() {
        contactState = null;
        contactData = { name: '', phone: '', issue: '' };
    }

    // ── Message Display Helpers ─────────────────────────────────────────────
    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.textContent = text;
        messagesContainer.appendChild(div);

        setTimeout(() => {
            div.classList.add('visible');
        }, 10);

        scrollToBottom();
    }

    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(div);

        setTimeout(() => {
            div.classList.add('visible');
        }, 10);

        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // ── Your original keyword-based pest responses ──────────────────────────
    function handlePestResponse(message) {
        const lower = message.toLowerCase();
        let response = "As a professional pest control consultant at Jelco Pest Solutions LLC, I'm here to help!\nCould you tell me more about the issue? (type of pest, location, etc.)";

        if (lower.includes('ant') || lower.includes('ants')) {
            response = "Ant infestations are common in the Joplin area, especially carpenter or pavement ants.\n• Describe the ants: size, color, location?\n• Indoors/outdoors? Trails visible?\nWe recommend a free inspection to identify and treat effectively.";
        } else if (lower.includes('termite') || lower.includes('termites')) {
            response = "Termites can cause serious structural damage—don't delay!\nSigns: mud tubes, discarded wings, hollow wood.\n• How long have you noticed this?\n• Any visible damage?\nOur experts can provide a thorough inspection and treatment plan.";
        } else if (lower.includes('bed bug') || lower.includes('bed bugs')) {
            response = "Bed bugs are tricky and spread quickly via travel or used furniture.\nSigns: itchy bites, blood spots on sheets, tiny dark spots.\n• Where are they appearing?\nWe use heat treatments and insecticides for complete elimination.";
        } else if (lower.includes('roach') || lower.includes('roaches') || lower.includes('cockroach')) {
            response = "Cockroaches pose health risks by spreading bacteria.\nCommon types: German or American.\n• Sightings at night? Droppings or egg cases?\nOur integrated pest management includes baiting and sealing entry points.";
        } else if (lower.includes('mouse') || lower.includes('mice') || lower.includes('rodent')) {
            response = "Rodents like mice can damage wiring and contaminate food.\nSigns: droppings, gnaw marks, scratching sounds.\n• Entry points visible?\nWe specialize in exclusion techniques and safe trapping.";
        } else if (lower.includes('spider') || lower.includes('spiders')) {
            response = "Most spiders are harmless, but some like brown recluses in Missouri can be dangerous.\nSigns: webs, egg sacs.\n• Bite symptoms? Species identification?\nRegular treatments reduce populations effectively.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            response = "Hello! As your Jelco Pest Solutions consultant, how can I help with pest control today?";
        }

        addBotMessage(response);
    }
});