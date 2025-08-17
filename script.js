let countdownInterval = null;
let targetTime = null;
let timerStartTime = null;
let initialCurrentCharge = null;
let maxCharge = null;
let lastMaxCharge = null;
let lastCurrentCharge = null;
let userModifiedCurrentCharge = false; // Track if user manually changed current charge

function getEscalationMessage(count) {
    const messages = [
    "Please enter a valid positive number!", "Please enter a valid positive number!", "Please enter a valid positive number!", "Please enter a valid positive number!", "Please enter a valid positive number!", "Please enter a valid positive number!", "Still not a valid number... numbers only.", "Okay, seriously. Stop.", "You're testing this on purpose, aren't you?", "Stop testing me. I have feelings.", "You're gonna have a bad time fam.", "...", "I'm gonna run out of messages for you.", "Is that what you really want?", "3 Left...", "2 Left...", "1 Left...", "...", "...", "...", "What do you really want?", "This site runs locally on your browser... It will not break.", "...", "...", "...", "Really...?", "...", "Okay okay, i get it!", "You're the type of person who likes to discover things...", "Well... since you're already here...", "You might aswell be on the game...", "...", "It has something to do with *her* name on it...", "On the apex domain...", "...", "Still confused?", "...", "Maybe you're not ready for the responsibility.", "...", "Good luck... if you're trying.", "...", "Goodbye if you're giving up.", "...", "Thanks for caring.", "...", "Bye.", "Bye.", "Bye.", "Bye.", "Bye.", "Bye.", "Please enter a valid positive number!"
    ];
    return messages[Math.min(count - 1, messages.length - 1)];
}

function incrementInvalidCount() {
    const raw = localStorage.getItem('chargeInvalidCount') || '0';
    const next = Math.min(999, parseInt(raw, 10) + 1);
    localStorage.setItem('chargeInvalidCount', String(next));
    return next;
}

function resetInvalidCount() {
    localStorage.setItem('chargeInvalidCount', '0');
}

function updateButtonState() {
    const button = document.getElementById('timerButton');
    const maxInput = document.getElementById('maxChargeInput');
    const currentInput = document.getElementById('currentChargeInput');
    
    if (!button) return;
    
    // If no timer is running
    if (!targetTime) {
        button.textContent = 'Start Timer';
        button.classList.remove('resync-btn', 'restart-btn');
        button.disabled = false;
        return;
    }
    
    // Check if max charge has changed
    const currentMaxValue = parseFloat(maxInput.value) || 0;
    if (lastMaxCharge !== null && currentMaxValue !== lastMaxCharge) {
        button.textContent = 'Restart Timer';
        button.classList.add('restart-btn');
        button.classList.remove('resync-btn');
        button.disabled = false;
        return;
    }
    
    // Check if current charge has changed (for resync)
    const currentChargeValue = parseFloat(currentInput.value) || 0;
    if (userModifiedCurrentCharge) {
        button.textContent = 'Resync';
        button.classList.add('resync-btn');
        button.classList.remove('restart-btn');
        button.disabled = false;
        return;
    }
    
    // Default state when timer is running - Resync disabled
    button.textContent = 'Resync';
    button.classList.add('resync-btn');
    button.classList.remove('restart-btn');
    button.disabled = true;
}

function startCountdown() {
    if (!targetTime) return;
    clearInterval(countdownInterval);

    function updateCountdown() {
        const now = new Date();
        const timeLeft = targetTime.getTime() - now.getTime();

        // Update current charge field in real-time
        if (timerStartTime && initialCurrentCharge !== null && maxCharge !== null) {
            const elapsedSeconds = (Date.now() - timerStartTime) / 1000;
            const chargesGained = Math.floor(elapsedSeconds / 30);
            const currentCharge = Math.min(initialCurrentCharge + chargesGained, maxCharge);
            
            const currentInput = document.getElementById('currentChargeInput');
            if (currentInput && document.activeElement !== currentInput && !userModifiedCurrentCharge) { 
                // Don't update if user is typing OR if user has manually modified the field
                currentInput.value = currentCharge;
                lastCurrentCharge = currentCharge; // Update the tracking variable
            }
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            localStorage.removeItem('targetTime'); // Clear saved time
            localStorage.removeItem('timerData'); // Clear timer data
            targetTime = null;
            timerStartTime = null;
            initialCurrentCharge = null;
            maxCharge = null;
            lastMaxCharge = null;
            lastCurrentCharge = null;
            userModifiedCurrentCharge = false;

            const result = document.getElementById('result');
            if (result) {
                const originalTargetTime = new Date(now.getTime() + timeLeft);
                const timeEl = result.querySelector('.result-time');
                if (timeEl) timeEl.textContent = originalTargetTime.toLocaleString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                });
                const top = result.querySelector('.result-text');
                if (top) top.innerHTML = 'Fully charged, go back to painting pixels.';
                const countdownEl = document.getElementById('countdownTime');
                if (countdownEl) countdownEl.textContent = 'CHARGES ARE FULL!';
                const countdownWrapper = document.getElementById('countdown');
                if (countdownWrapper) countdownWrapper.style.color = '#cc2e2e';
                
                // Set current charge to max charge when timer completes
                const currentInput = document.getElementById('currentChargeInput');
                const maxInput = document.getElementById('maxChargeInput');
                if (currentInput && maxInput && maxInput.value) {
                    currentInput.value = maxInput.value;
                }
            }
            updateButtonState();
            resetInvalidCount();
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        const dd = String(days).padStart(2, '0'), hh = String(hours).padStart(2, '0'),
            mm = String(minutes).padStart(2, '0'), ss = String(seconds).padStart(2, '0');
        const countdownTimeEl = document.getElementById('countdownTime');
        if (countdownTimeEl) countdownTimeEl.textContent = `${dd}d ${hh}h ${mm}m ${ss}s`;
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function displayCountdownResult(time) {
    targetTime = time;
    const result = document.getElementById('result');
    const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    };
    const formattedTime = time.toLocaleString('en-US', options);

    result.innerHTML = 
        `<div class="result-text">
            Your Wplace charges will be full at:
        </div><div class="result-time">${formattedTime}</div><div id="countdown" style="margin-top: 1rem; font-size: 1rem; font-weight: 600; color: #cc4e4e;">
                <i class="fas fa-clock"></i> <span id="countdownTime">Loading...</span>
            </div>`
    ;
    result.classList.add('show');
    startCountdown();
}

function calculateChargeTime() {
    const maxInput = document.getElementById('maxChargeInput');
    const currentInput = document.getElementById('currentChargeInput');
    const result = document.getElementById('result');
    
    const maxChargeValue = parseFloat(maxInput.value);
    const currentChargeValue = parseFloat(currentInput.value) || 0; // Default to 0 if empty
    
    // Validate inputs
    if (isNaN(maxChargeValue) || maxChargeValue <= 0) {
        const count = incrementInvalidCount();
        const msg = getEscalationMessage(count);
        result.innerHTML = `<div class="result-text" style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> ${msg}</div>`;
        result.classList.remove('show');
        clearInterval(countdownInterval);
        localStorage.removeItem('targetTime');
        localStorage.removeItem('timerData');
        targetTime = null;
        return;
    }
    
    if (currentChargeValue < 0 || currentChargeValue > maxChargeValue) {
        result.innerHTML = `<div class="result-text" style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> Current charge must be between 0 and max charge!</div>`;
        result.classList.remove('show');
        clearInterval(countdownInterval);
        localStorage.removeItem('targetTime');
        localStorage.removeItem('timerData');
        targetTime = null;
        return;
    }
    
    resetInvalidCount();
    clearInterval(countdownInterval);
    
    // Calculate remaining charges needed
    const chargesNeeded = maxChargeValue - currentChargeValue;
    const totalSeconds = chargesNeeded * 30;
    const newTargetTime = new Date(Date.now() + totalSeconds * 1000);
    
    // Store timer data
    timerStartTime = Date.now();
    initialCurrentCharge = currentChargeValue;
    maxCharge = maxChargeValue;
    lastMaxCharge = maxChargeValue;
    lastCurrentCharge = currentChargeValue;
    userModifiedCurrentCharge = false; // Reset the flag when starting a new timer
    
    const timerData = {
        targetTime: newTargetTime.getTime(),
        timerStartTime: timerStartTime,
        initialCurrentCharge: initialCurrentCharge,
        maxCharge: maxCharge
    };
    
    localStorage.setItem('timerData', JSON.stringify(timerData));
    displayCountdownResult(newTargetTime);
    updateButtonState();
}

function handleTimerAction() {
    const button = document.getElementById('timerButton');
    const buttonText = button.textContent;
    
    if (button.disabled) return; // Prevent action if button is disabled
    
    if (buttonText === 'Start Timer' || buttonText === 'Restart Timer') {
        calculateChargeTime();
    } else if (buttonText === 'Resync') {
        // Resync with new current charge value
        const currentInput = document.getElementById('currentChargeInput');
        const newCurrentCharge = parseFloat(currentInput.value) || 0;
        
        if (timerStartTime && maxCharge !== null) {
            // Calculate how many charges have been gained since timer started
            const elapsedSeconds = (Date.now() - timerStartTime) / 1000;
            const chargesGained = Math.floor(elapsedSeconds / 30);
            const expectedCurrentCharge = Math.min(initialCurrentCharge + chargesGained, maxCharge);
            
            // Use the user's input as the new baseline
            const chargesNeeded = maxCharge - newCurrentCharge;
            
            if (chargesNeeded <= 0) {
                // Already fully charged
                clearInterval(countdownInterval);
                localStorage.removeItem('targetTime');
                localStorage.removeItem('timerData');
                targetTime = null;
                
                const result = document.getElementById('result');
                result.innerHTML = `<div class="result-text">Fully charged, go back to painting pixels.</div>`;
                result.classList.add('show');
                updateButtonState();
                return;
            }
            
            const totalSeconds = chargesNeeded * 30;
            const newTargetTime = new Date(Date.now() + totalSeconds * 1000);
            
            // Update stored values
            timerStartTime = Date.now();
            initialCurrentCharge = newCurrentCharge;
            lastCurrentCharge = newCurrentCharge;
            userModifiedCurrentCharge = false; // Reset the flag after resync
            
            const timerData = {
                targetTime: newTargetTime.getTime(),
                timerStartTime: timerStartTime,
                initialCurrentCharge: initialCurrentCharge,
                maxCharge: maxCharge
            };
            
            localStorage.setItem('timerData', JSON.stringify(timerData));
            displayCountdownResult(newTargetTime);
            updateButtonState();
        }
    }
}

// Add input event listeners
document.addEventListener('DOMContentLoaded', function() {
    const maxInput = document.getElementById('maxChargeInput');
    const currentInput = document.getElementById('currentChargeInput');
    
    if (maxInput) {
        maxInput.addEventListener('input', updateButtonState);
        maxInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleTimerAction();
            }
        });
    }
    
    if (currentInput) {
        currentInput.addEventListener('input', function() {
            // Mark that user has manually modified the current charge
            if (targetTime) { // Only if timer is running
                userModifiedCurrentCharge = true;
            }
            updateButtonState();
        });
        currentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleTimerAction();
            }
        });
    }
});

window.addEventListener('load', function() {
    const maxInput = document.getElementById('maxChargeInput');
    if (maxInput) maxInput.focus();
    
    // Restore timer if it exists
    const savedTimerData = localStorage.getItem('timerData');
    if (savedTimerData) {
        try {
            const data = JSON.parse(savedTimerData);
            const timestamp = data.targetTime;
            
            if (timestamp > Date.now()) {
                // Restore timer state
                targetTime = new Date(timestamp);
                timerStartTime = data.timerStartTime;
                initialCurrentCharge = data.initialCurrentCharge;
                maxCharge = data.maxCharge;
                lastMaxCharge = data.maxCharge;
                lastCurrentCharge = data.initialCurrentCharge;
                userModifiedCurrentCharge = false; // Reset on load
                
                // Calculate current charge based on elapsed time
                const elapsedSeconds = (Date.now() - timerStartTime) / 1000;
                const chargesGained = Math.floor(elapsedSeconds / 30);
                const currentCharge = Math.min(initialCurrentCharge + chargesGained, maxCharge);
                
                // Update input fields
                if (maxInput) maxInput.value = maxCharge;
                const currentInput = document.getElementById('currentChargeInput');
                if (currentInput) currentInput.value = currentCharge;
                
                displayCountdownResult(targetTime);
                updateButtonState();
            } else {
                // Timer expired
                localStorage.removeItem('timerData');
            }
        } catch (e) {
            localStorage.removeItem('timerData');
        }
    }
});
