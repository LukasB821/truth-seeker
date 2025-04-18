// Function to access terminal (replaces create-account click)
function accessTerminal() {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    setTimeout(() => {
      document.getElementById('mainContent').classList.add('active');
      // Set initial sync time
      updateSyncTime();
      // Start timer to update sync time periodically
      setInterval(updateSyncTime, 60000); // Update every minute
    }, 10);
}

// Update Sync Time Function
function updateSyncTime() {
    const syncTimeEl = document.getElementById('syncTime');
    if (syncTimeEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        syncTimeEl.textContent = `TODAY ${timeString} UTC`; // Assuming UTC for consistency
    }
}

 // Global Notification function
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    let bgColor = 'var(--neon-blue)';
    let textColor = 'var(--dark-bg)';
    if (type === 'error') { bgColor = 'var(--neon-pink)'; textColor = 'white'; }
    else if (type === 'success') { bgColor = 'var(--neon-green)'; textColor = 'var(--dark-bg)'; }
    else if (type === 'warning') { bgColor = 'var(--neon-yellow)'; textColor = 'var(--dark-bg)'; }

    notification.style.backgroundColor = bgColor;
    notification.style.color = textColor;
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '0';
    notification.style.boxShadow = `0 0 20px ${bgColor}`;
    notification.style.zIndex = '2000';
    notification.style.animation = 'fadeIn 0.3s ease-out';
    notification.style.fontFamily = "'Share Tech Mono', monospace";
    notification.style.fontSize = '15px';
    notification.style.border = `2px solid ${bgColor}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => {
        notification.remove();
        }, 300);
    }, duration);
}

// Clipboard copy function
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(successMessage, 'success');
    }).catch(err => {
         showNotification('FAILED TO COPY', 'error');
         console.error('Clipboard Error:', err);
    });
}

// Function to navigate to a specific tab programmatically
function navigateToTab(targetId) {
    const targetTab = document.querySelector(`.sidebar li[data-target="${targetId}"]`);
    if (targetTab) {
        targetTab.click(); // Simulate click on the tab
    }
}

document.addEventListener('DOMContentLoaded', () => {
  // Splash screen Login button event
  document.getElementById('loginButton').addEventListener('click', function(e) {
    e.preventDefault();
    accessTerminal(); // Use the access function
  });

  /*** Tab Navigation ***/
  const tabs = document.querySelectorAll('.sidebar li');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');
  const mainContent = document.querySelector('.main-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Deactivate current tab/content
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      // Activate new tab/content
      this.classList.add('active');
      const targetId = this.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if(targetContent) {
         targetContent.classList.add('active');
      }

      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }

      // Scroll to top of content area
      // Use documentElement for broader compatibility
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' }); // Fallback for older browsers


       // Re-initialize charts if they are in the newly activated tab
       if (targetId === 'trading' && bitcoinChartInstance) bitcoinChartInstance.update();
       if (targetId === 'dca' && dcaChartInstance) dcaChartInstance.update();
       if (targetId === 'account') {
           if(walletGainsChartInstance) walletGainsChartInstance.update();
           if(tradingBotGainsChartInstance) tradingBotGainsChartInstance.update();
       }
    });
  });

  /*** Hamburger Menu Toggle ***/
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const closeSidebar = document.getElementById('closeSidebar');

  hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  });

  const closeSidebarAction = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  closeSidebar.addEventListener('click', closeSidebarAction);
  overlay.addEventListener('click', closeSidebarAction);

  /*** Daily Reward Button ***/
  let dailyRewardClaimed = false; // State variable
  const dailyRewardButton = document.getElementById('dailyRewardButton');
  const dailyRewardAmountSpan = document.getElementById('dailyRewardAmount');
  const dailyRewardAmount = 10; // Example amount

  if (dailyRewardButton) {
      dailyRewardButton.addEventListener('click', function () {
        if (!dailyRewardClaimed) {
            this.innerHTML = '<i class="fas fa-check"></i> REWARD CLAIMED';
            this.classList.remove('btn-primary', 'pulse');
            this.classList.add('btn-success');
            this.disabled = true;
            dailyRewardClaimed = true; // Set state

            // Simulate updating HVITAL balance (add this logic if needed)
            const hvitalBalanceEl = document.getElementById('hvitalBalanceWallet');
            if (hvitalBalanceEl) {
                let currentBalance = parseInt(hvitalBalanceEl.innerText.replace(' HVITAL', ''), 10);
                hvitalBalanceEl.innerText = `${currentBalance + dailyRewardAmount} HVITAL`;
            }
            // Update dashboard balance too if separate element exists

            showNotification(`<i class="fas fa-gift"></i> DAILY REWARD CLAIMED! +${dailyRewardAmount} HVITAL`, 'success');

            // Add transaction to history
            const transactionList = document.getElementById('transactionsList');
            if (transactionList) {
                 const newTx = document.createElement('li');
                 newTx.className = 'transaction-item';
                 newTx.innerHTML = `
                    <div> <span class="transaction-type transaction-in">IN</span> <span class="text-primary">${dailyRewardAmount} HVITAL</span> </div>
                    <div> <span>DAILY REWARD</span> </div>
                    <div> <span>JUST NOW</span> </div>
                 `;
                 // Insert at the top if list isn't empty, otherwise replace placeholder
                const firstItem = transactionList.querySelector('.transaction-item span:contains("NO RECENT")');
                if(firstItem) {
                    transactionList.innerHTML = ''; // Clear placeholder
                    transactionList.appendChild(newTx);
                } else {
                     transactionList.insertBefore(newTx, transactionList.firstChild);
                }
            }

            // Optional: Set a timer to re-enable the button after 24 hours
            setTimeout(() => {
                 this.innerHTML = '<i class="fas fa-gift"></i> CLAIM REWARD';
                 this.classList.remove('btn-success');
                 this.classList.add('btn-primary', 'pulse');
                 this.disabled = false;
                 dailyRewardClaimed = false; // Reset state
                 showNotification('DAILY HVITAL REWARD AVAILABLE AGAIN!', 'info');
             }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        } else {
            showNotification('DAILY REWARD ALREADY CLAIMED. PLEASE WAIT.', 'warning');
        }
      });
  }


  /*** Wallet Functions ***/
  let isWalletConnected = false;

  function updateWalletUI(connected, pubkey = 'N/A', balance = '0 sats') {
     const statusEl = document.getElementById('walletStatus');
     const addressEl = document.getElementById('walletAddress');
     const balanceEl = document.getElementById('walletBalance');
     const connectHeaderBtn = document.getElementById('connectWalletHeader');
     const connectTabBtn = document.getElementById('connectWalletTab');
     const copyBtn = document.getElementById('copyAddress');
     const transactionList = document.getElementById('transactionsList'); // Keep existing logic for LN tx

     if (connected) {
          statusEl.innerHTML = `<i class="fas fa-check-circle text-success"></i> CONNECTED: LIGHTNING WALLET`;
          addressEl.innerText = pubkey;
          balanceEl.innerText = balance;
          connectHeaderBtn.innerHTML = '<i class="fas fa-check-circle"></i> CONNECTED';
          connectTabBtn.innerHTML = '<i class="fas fa-check-circle"></i> CONNECTED';
          connectHeaderBtn.disabled = true;
          connectTabBtn.disabled = true;
          connectHeaderBtn.classList.add('btn-success');
          connectTabBtn.classList.add('btn-success');
          copyBtn.style.display = 'inline-block';
          isWalletConnected = true;

          // Simulate adding some LN transactions if needed
          // transactionList.innerHTML = `...`; // Keep previous LN tx logic
     } else {
          statusEl.innerText = 'WALLET NOT CONNECTED';
          addressEl.innerText = 'N/A';
          balanceEl.innerText = '0 sats';
          connectHeaderBtn.innerHTML = '<i class="fas fa-wallet"></i> CONNECT WALLET';
          connectTabBtn.innerHTML = '<i class="fas fa-plug"></i> CONNECT WALLET';
          connectHeaderBtn.disabled = false;
          connectTabBtn.disabled = false;
          connectHeaderBtn.classList.remove('btn-success');
          connectTabBtn.classList.remove('btn-success');
          copyBtn.style.display = 'none';
          // Don't clear HVITAL transactions here
          // transactionList.innerHTML = `<li class="transaction-item"><div><span>NO RECENT LN TRANSACTIONS</span></div></li>`;
          isWalletConnected = false;
     }
  }

  async function connectWallet() {
    if (window.webln) {
      try {
        showNotification('ATTEMPTING TO CONNECT WALLET...');
        await window.webln.enable();
        const info = await window.webln.getInfo();
        const balanceInfo = await window.webln.getBalance();
        const pubkey = info?.node?.pubkey ?? 'UNAVAILABLE';
        const balance = balanceInfo?.balance ? `${balanceInfo.balance.toLocaleString()} sats` : 'UNAVAILABLE';

        updateWalletUI(true, pubkey, balance);
        showNotification('WALLET CONNECTED SUCCESSFULLY!', 'success');

      } catch (error) {
        console.error("WEBLN ERROR:", error);
        showNotification(`ERROR CONNECTING WALLET: ${error.message}`, 'error');
        updateWalletUI(false);
      }
    } else {
      showNotification("WEBLN PROVIDER NOT FOUND. INSTALL ALBY OR BRAVE WALLET.", 'warning', 5000);
      updateWalletUI(false);
    }
  }

 async function sendPayment() {
     if (!isWalletConnected) {
         showNotification("PLEASE CONNECT YOUR LIGHTNING WALLET FIRST.", 'warning');
         return;
     }
     if (window.webln && window.webln.sendPayment) {
         const invoice = prompt("ENTER LIGHTNING INVOICE (BOLT11):");
         if (invoice && invoice.startsWith('ln')) {
             try {
                 showNotification('SENDING PAYMENT...');
                 const result = await window.webln.sendPayment(invoice);
                 console.log("PAYMENT RESULT:", result);
                 showNotification(`PAYMENT SENT! PREIMAGE: ${result?.preimage?.substring(0,10)}...`, 'success', 5000);
                 // TODO: Update LN balance and transaction history
             } catch (error) {
                 console.error("SEND PAYMENT ERROR:", error);
                 showNotification(`PAYMENT FAILED: ${error.message}`, 'error', 5000);
             }
         } else if (invoice) {
             showNotification("INVALID LIGHTNING INVOICE FORMAT.", 'error');
         }
     } else {
         showNotification("SENDPAYMENT NOT AVAILABLE. CHECK YOUR WEBLN PROVIDER.", 'warning');
     }
 }

 async function receivePayment() {
     if (!isWalletConnected) {
         showNotification("PLEASE CONNECT YOUR LIGHTNING WALLET FIRST.", 'warning');
         return;
     }
     if (window.webln && window.webln.makeInvoice) {
         const amount = prompt("ENTER AMOUNT IN SATS (E.G., 1000):");
         if (amount && !isNaN(parseInt(amount, 10)) && parseInt(amount, 10) > 0) {
             try {
                  showNotification('CREATING INVOICE...');
                  const result = await window.webln.makeInvoice({ amount: parseInt(amount, 10) });
                  const invoice = result.paymentRequest;

                  const modalOverlay = document.createElement('div');
                  modalOverlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 2500; backdrop-filter: blur(5px); padding: 15px;`;
                  modalOverlay.onclick = (e) => { if(e.target === modalOverlay) modalOverlay.remove(); };

                  const modalContent = document.createElement('div');
                  modalContent.style.cssText = `background: var(--panel-bg); color: var(--text-primary); padding: 30px; border-radius: 0; box-shadow: 0 0 30px var(--neon-blue); max-width: 500px; width: 100%; border: 2px solid var(--neon-blue); text-align: center;`;

                  modalContent.innerHTML = `
                     <h3 style="color: var(--neon-blue); margin-bottom: 15px; font-family: 'Orbitron', sans-serif; font-size: 1.5rem;">RECEIVE LN PAYMENT</h3>
                     <p style="color: var(--text-secondary); margin-bottom: 20px;">SCAN QR CODE OR COPY INVOICE:</p>
                     <div id="receiveQR" style="background: white; padding: 10px; border-radius: 0; margin: 0 auto 20px; display: inline-block;"></div>
                     <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 0; font-family: monospace; word-break: break-all; margin-bottom: 25px; font-size: 12px; text-align: left; border: 1px solid var(--neon-blue);">${invoice}</div>
                     <div style="display: flex; gap: 15px;">
                         <button id="copyInvoiceBtnModal" class="btn btn-sm btn-primary" style="flex: 1;"> <i class="fas fa-copy"></i> COPY INVOICE </button>
                         <button id="closeInvoiceBtnModal" class="btn btn-sm" style="flex: 1;"> <i class="fas fa-times"></i> CLOSE </button>
                     </div>
                  `;

                  modalOverlay.appendChild(modalContent);
                  document.body.appendChild(modalOverlay);

                  new QRCode(modalContent.querySelector("#receiveQR"), {
                      text: `lightning:${invoice}`,
                      width: 180,
                      height: 180,
                      colorDark: "#000000",
                      colorLight: "#ffffff",
                      correctLevel: QRCode.CorrectLevel.M
                  });

                  modalContent.querySelector('#copyInvoiceBtnModal').onclick = () => {
                      copyToClipboard(invoice, 'LN Invoice Copied!');
                  };
                  modalContent.querySelector('#closeInvoiceBtnModal').onclick = () => {
                      modalOverlay.remove();
                  };

             } catch (error) {
                 console.error("INVOICE CREATION ERROR:", error);
                 showNotification(`INVOICE CREATION FAILED: ${error.message}`, 'error', 5000);
             }
         } else if (amount) {
             showNotification("PLEASE ENTER A VALID POSITIVE NUMBER FOR SATS.", 'error');
         }
     } else {
         showNotification("MAKEINVOICE NOT AVAILABLE. CHECK YOUR WEBLN PROVIDER.", 'warning');
     }
 }

 // --- HVITAL Specific Wallet Functions ---
 function sendHvital() {
      const recipient = prompt("Enter recipient username:");
      if (!recipient) return;

      const amountStr = prompt(`Enter HVITAL amount to send to ${recipient}:`);
      const amount = parseInt(amountStr, 10);

      if (isNaN(amount) || amount <= 0) {
           showNotification("Invalid HVITAL amount.", 'error');
           return;
      }

      // Simulate checking balance
      const hvitalBalanceEl = document.getElementById('hvitalBalanceWallet');
      let currentBalance = 0;
      if (hvitalBalanceEl) {
        currentBalance = parseInt(hvitalBalanceEl.innerText.replace(' HVITAL', ''), 10);
      }

      if (amount > currentBalance) {
        showNotification("Insufficient HVITAL balance.", 'error');
        return;
      }

      // Simulate successful send
      showNotification(`Sending ${amount} HVITAL to ${recipient}...`, 'info');
      setTimeout(() => {
          // Update balance
          if (hvitalBalanceEl) {
              hvitalBalanceEl.innerText = `${currentBalance - amount} HVITAL`;
          }
           // Update dashboard balance too if separate element exists

          // Add transaction to history
          const transactionList = document.getElementById('transactionsList');
          if (transactionList) {
               const newTx = document.createElement('li');
               newTx.className = 'transaction-item';
               newTx.innerHTML = `
                   <div> <span class="transaction-type transaction-out">OUT</span> <span class="text-primary">${amount} HVITAL</span> </div>
                   <div> <span>SEND TO @${recipient.toUpperCase()}</span> </div>
                   <div> <span>JUST NOW</span> </div>
               `;
               transactionList.insertBefore(newTx, transactionList.firstChild);
          }
          showNotification(`Successfully sent ${amount} HVITAL to ${recipient}!`, 'success');
      }, 1500); // Simulate network delay
 }

  /*** Wallet Event Listeners ***/
   const connectWalletHeader = document.getElementById('connectWalletHeader');
   const connectWalletTab = document.getElementById('connectWalletTab');
   const sendPaymentButton = document.getElementById('sendPayment');
   const receivePaymentButton = document.getElementById('receivePayment');
   const copyAddressButton = document.getElementById('copyAddress');
   const sendHvitalButton = document.getElementById('sendHvital'); // Added HVITAL send button

   if (connectWalletHeader) connectWalletHeader.addEventListener('click', connectWallet);
   if (connectWalletTab) connectWalletTab.addEventListener('click', connectWallet);
   if (sendPaymentButton) sendPaymentButton.addEventListener('click', sendPayment);
   if (receivePaymentButton) receivePaymentButton.addEventListener('click', receivePayment);
   if (sendHvitalButton) sendHvitalButton.addEventListener('click', sendHvital); // Added listener
   if (copyAddressButton) {
        copyAddressButton.addEventListener('click', () => {
            const walletAddress = document.getElementById('walletAddress').innerText;
            if (walletAddress && walletAddress !== 'N/A') {
                copyToClipboard(walletAddress, 'Wallet Address Copied!');
            }
        });
   }

    // --- HVITAL Social Tipping ---
    function handleHvitalTip(event) {
        const button = event.target.closest('.send-hvital-tip-btn');
        if (!button) return;

        const recipient = button.dataset.recipient;
        const amount = 5; // Fixed tip amount for simplicity

        // Simulate checking balance
        const hvitalBalanceEl = document.getElementById('hvitalBalanceWallet');
        let currentBalance = 0;
        if (hvitalBalanceEl) {
            currentBalance = parseInt(hvitalBalanceEl.innerText.replace(' HVITAL', ''), 10);
        }

        if (amount > currentBalance) {
            showNotification("Insufficient HVITAL balance to tip.", 'error');
            return;
        }

        showNotification(`Sending ${amount} HVITAL tip to ${recipient}...`, 'info');
        setTimeout(() => {
             // Update balance
            if (hvitalBalanceEl) {
                hvitalBalanceEl.innerText = `${currentBalance - amount} HVITAL`;
            }
             // Update dashboard balance too if separate element exists

             // Add transaction to history
            const transactionList = document.getElementById('transactionsList');
            if (transactionList) {
                const newTx = document.createElement('li');
                newTx.className = 'transaction-item';
                newTx.innerHTML = `
                    <div> <span class="transaction-type transaction-out">OUT</span> <span class="text-primary">${amount} HVITAL</span> </div>
                    <div> <span>TIP @${recipient.toUpperCase()}</span> </div>
                    <div> <span>JUST NOW</span> </div>
                `;
                transactionList.insertBefore(newTx, transactionList.firstChild);
            }

             // Update the post's tip counter (optional visual feedback)
             const postMeta = button.closest('.post').querySelector('.post-meta');
             const tipCounter = postMeta.querySelector('.fa-coins')?.parentElement;
             if (tipCounter) {
                 let currentTips = parseInt(tipCounter.textContent.match(/(\d+)/)?.[0] || '0', 10);
                 tipCounter.innerHTML = `<i class="fas fa-coins text-primary"></i> ${currentTips + amount} HVITAL`;
                 tipCounter.dataset.tooltip = `RECEIVED ${currentTips + amount} HVITAL TIPS`;
             }

            showNotification(`Successfully tipped ${amount} HVITAL to ${recipient}!`, 'success');
        }, 1500); // Simulate network delay
    }

    // Add event listener to the social feed container(s) for delegation
    const socialFeedFollowing = document.getElementById('following');
    if (socialFeedFollowing) {
        socialFeedFollowing.addEventListener('click', handleHvitalTip);
    }
     // Add listeners to other feeds if they also have tipping buttons


   /*** Chart Variables ***/
   let bitcoinChartInstance = null;
   let dcaChartInstance = null;
   let walletGainsChartInstance = null;
   let tradingBotGainsChartInstance = null;

   /*** Chart Common Options & Functions ***/
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: { color: '#b0b0b0', font: { family: 'Share Tech Mono' } },
            grid: { color: 'rgba(0, 217, 232, 0.2)', borderDash: [3, 3] }
          },
          x: {
            ticks: { color: '#b0b0b0', font: { family: 'Share Tech Mono' } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { labels: { color: 'var(--text-primary)', font: { family: 'Share Tech Mono' } } },
          tooltip: {
            enabled: true,
            backgroundColor: 'var(--panel-bg)',
            titleColor: 'var(--neon-blue)',
            bodyColor: 'var(--text-primary)',
            borderColor: 'var(--neon-blue)',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: 'Orbitron', weight: 'normal', size: 16 },
            bodyFont: { family: 'Share Tech Mono' },
            boxPadding: 5,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                     const scale = context.chart.options.scales.y;
                     // Check if the scale callback includes '%' to determine format
                     if (scale?.ticks?.callback && typeof scale.ticks.callback === 'function' && scale.ticks.callback(1).includes('%')) {
                        label += context.parsed.y.toFixed(1) + '%';
                     } else {
                        // Default to currency format
                        label += '$' + context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                     }
                }
                return label;
              }
            }
          }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest', // Changed for better line chart interaction
            intersect: false,
            axis: 'x'
        },
    };

   // Deep merge function for chart options
   function mergeOptions(target, ...sources) {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                const targetValue = target[key];
                const sourceValue = source[key];
                if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue) && targetValue !== null && typeof targetValue === 'object') {
                     // Recursively merge objects
                     target[key] = mergeOptions({}, targetValue, sourceValue); // Create new object for merge result
                } else if (sourceValue !== undefined) {
                    // Assign primitive values or replace arrays/non-objects
                     target[key] = sourceValue;
                }
            });
        });
        return target;
   }


  /*** Trading Bot Chart ***/
  const bitcoinChartCtx = document.getElementById('bitcoinChart')?.getContext('2d');
  if (bitcoinChartCtx) {
      const priceData = [42000, 42120, 42350, 42800, 42500, 42300, 42350, 42400, 42650, 42550, 42700, 42900];
      const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON+1', 'TUE+1', 'WED+1', 'THU+1', 'FRI+1'];

      bitcoinChartInstance = new Chart(bitcoinChartCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'BTC PRICE (USD)',
            data: priceData,
            borderColor: 'rgba(5, 217, 232, 1)',
            borderWidth: 2.5,
            fill: true,
            backgroundColor: 'rgba(0, 217, 232, 0.1)',
            tension: 0.4,
            pointBackgroundColor: 'rgba(5, 217, 232, 1)',
            pointBorderColor: 'rgba(13, 2, 33, 1)',
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(5, 217, 232, 1)'
          }]
        },
        options: mergeOptions({}, commonChartOptions, {
            plugins: { tooltip: { callbacks: { label: (ctx) => `BTC: $${ctx.parsed.y.toLocaleString()}` } } }
        })
      });

      const buySuggestion = Math.min(...priceData) * 0.995;
      const sellSuggestion = Math.max(...priceData) * 1.005;
      const priceSuggestionsEl = document.getElementById('priceSuggestions');
      if (priceSuggestionsEl) {
        priceSuggestionsEl.innerHTML = `
        <div class="wallet-info" style="grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="wallet-info-item" style="border-left-color: var(--neon-green);">
            <strong><i class="fas fa-arrow-down text-success"></i> POTENTIAL BUY ZONE</strong>
            <span style="font-size: 1.1em; color: var(--text-primary);">$${buySuggestion.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          <div class="wallet-info-item" style="border-left-color: var(--neon-pink);">
            <strong><i class="fas fa-arrow-up text-error"></i> POTENTIAL SELL ZONE</strong>
            <span style="font-size: 1.1em; color: var(--text-primary);">$${sellSuggestion.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
        </div>`;
      }
  }

  /*** DCA Chart ***/
   const dcaChartCtx = document.getElementById('dcaChart')?.getContext('2d');
   if (dcaChartCtx) {
        const marketPriceData = [42000, 41800, 42100, 41500, 41950, 42350, 42100, 42500, 42200, 42600];
        const labels = marketPriceData.map((_, i) => `DAY ${i + 1}`);
        let totalInvested = 0;
        let totalBtc = 0;
        const avgCostData = marketPriceData.map(price => {
            const investment = 50;
            totalInvested += investment;
            totalBtc += investment / price;
            return totalBtc > 0 ? totalInvested / totalBtc : price;
        });

        dcaChartInstance = new Chart(dcaChartCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'MARKET PRICE',
                data: marketPriceData,
                borderColor: 'rgba(0, 255, 159, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 5
              },
              {
                label: 'AVERAGE COST BASIS',
                data: avgCostData,
                borderColor: 'rgba(247, 247, 0, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.1,
                pointRadius: 0, // Hide points for average cost
                 pointHoverRadius: 0
              }
            ]
          },
          options: mergeOptions({}, commonChartOptions, {
              plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString(undefined, {maximumFractionDigits: 0})}` } } }
          })
        });
    }

// Function to create bar charts with common percentage options
function createPercentageBarChart(canvasId, data, label) {
     const ctx = document.getElementById(canvasId)?.getContext('2d');
     if (!ctx) return null;

     // Define custom options for percentage scale and tooltip
     const customOptions = {
         scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: function(value) { return value + '%'; } } // Add % to y-axis ticks
            }
         },
         plugins: {
             legend: { display: false },
             tooltip: {
                  callbacks: { label: (ctx) => `${label}: ${ctx.parsed.y.toFixed(1)}%` } // Format tooltip label as percentage
             }
         }
     };

     // Merge common options with custom options
     const chartOptions = mergeOptions({}, commonChartOptions, customOptions);


     return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ALL TIME'],
          datasets: [{
            label: label,
            data: data,
            backgroundColor: [
                'rgba(0, 217, 232, 0.6)', 'rgba(0, 217, 232, 0.7)', 'rgba(0, 217, 232, 0.8)',
                'rgba(0, 255, 170, 0.7)', 'rgba(0, 255, 170, 0.8)'
            ],
            borderColor: [
                'var(--neon-blue)', 'var(--neon-blue)', 'var(--neon-blue)',
                'var(--neon-green)', 'var(--neon-green)'
            ],
            borderWidth: 1.5,
            borderRadius: 0,
            barThickness: 'flex',
            maxBarThickness: 30
          }]
        },
        options: chartOptions // Use the merged options
     });
}

/*** Account Tab Charts ***/
walletGainsChartInstance = createPercentageBarChart('walletGainsChart', [0.5, 2.1, 6.5, 45, 125], 'WALLET GAINS');
tradingBotGainsChartInstance = createPercentageBarChart('tradingBotGainsChart', [0.2, 1.5, 5.0, 40, 90], 'BOT GAINS');

/*** Social Tabs Toggle ***/
const socialTabs = document.querySelectorAll('.social-tab');
socialTabs.forEach(tab => {
  tab.addEventListener('click', function () {
    socialTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.social-feed').forEach(feed => feed.style.display = 'none');
    const selectedTabId = this.getAttribute('data-tab');
    const activeFeed = document.getElementById(selectedTabId);
    if (activeFeed) {
        activeFeed.style.display = 'block';
        // Force reflow/repaint to restart animation
        activeFeed.style.animation = 'none';
         // Reading offsetHeight forces reflow
        void activeFeed.offsetHeight;
        activeFeed.style.animation = '';
    }
  });
});

/*** QR Code Generation ***/
const qrElement = document.getElementById("helpCreatorQR");
if (qrElement && typeof QRCode !== 'undefined') {
    try {
        // Using a placeholder LN invoice - replace with actual if available
        const lnInvoicePlaceholder = "lnbc1..."; // Replace
        new QRCode(qrElement, {
            text: `lightning:${lnInvoicePlaceholder}`, // Use actual LN invoice if generated
            width: 220,
            height: 220,
            colorDark: "#121212",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    } catch (e) {
        console.error("QR GENERATION ERROR:", e);
        qrElement.innerHTML = "<p style='color:var(--neon-pink);'>QR ERROR</p>";
    }
} else if (qrElement) {
    qrElement.innerHTML = "<p style='color:var(--neon-yellow);'>QR LIBRARY MISSING</p>";
}

// Create Post Functionality
const createPostTextarea = document.getElementById('createPostTextarea');
const createPostButton = document.getElementById('createPostButton');
const yourPageFeed = document.getElementById('yourpage');
const createPostCard = yourPageFeed?.querySelector('.cyber-panel:has(#createPostTextarea)');

if (createPostButton && createPostTextarea && yourPageFeed && createPostCard) {
    createPostButton.addEventListener('click', () => {
        const postText = createPostTextarea.value.trim();

        if (postText) {
            const escapedText = postText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

            const newPostHTML = `
            <div class="cyber-panel post" style="animation: fadeIn 0.5s ease;">
              <div class="post-header">
                <img src="https://i.pravatar.cc/150?img=1" alt="avatar" data-tooltip="YOUR PROFILE"/>
                <span data-tooltip="YOUR PROFILE">YOURUSERNAME</span>
                <div class="post-actions">
                  <button class="btn btn-sm edit-post-btn" data-tooltip="EDIT YOUR POST"> <i class="fas fa-edit"></i> EDIT </button>
                  <button class="btn btn-sm btn-danger delete-post-btn" data-tooltip="DELETE YOUR POST"> <i class="fas fa-trash"></i> DELETE </button>
                </div>
              </div>
              <div class="post-body">
                <p>${escapedText}</p>
                <div class="post-meta">
                  <span class="post-meta-item" data-tooltip="POSTED JUST NOW"><i class="far fa-clock"></i> JUST NOW</span>
                  <span class="post-meta-item" data-tooltip="0 LIKES"><i class="far fa-heart"></i> 0</span>
                  <span class="post-meta-item" data-tooltip="0 COMMENTS"><i class="far fa-comment"></i> 0</span>
                   <span class="post-meta-item" data-tooltip="RECEIVED 0 HVITAL TIPS"><i class="fas fa-coins text-secondary"></i> 0 HVITAL</span>
                </div>
              </div>
            </div>`;

            createPostCard.insertAdjacentHTML('afterend', newPostHTML);
            createPostTextarea.value = '';
            showNotification('POST CREATED SUCCESSFULLY!', 'success');

        } else {
            showNotification('CANNOT CREATE EMPTY POST.', 'warning');
        }
    });

    // Add event listener for delete/edit buttons (using event delegation on the feed)
    yourPageFeed.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.delete-post-btn');
        const editBtn = event.target.closest('.edit-post-btn'); // Placeholder for edit

        if (deleteBtn) {
            const postElement = deleteBtn.closest('.post');
            if(confirm('DELETE THIS POST?')) {
                postElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                postElement.style.opacity = '0';
                postElement.style.transform = 'scale(0.95)';
                setTimeout(() => postElement.remove(), 300);
                showNotification('POST DELETED.', 'info');
            }
        } else if (editBtn) {
            // Add edit functionality here later
             showNotification('EDIT FUNCTIONALITY NOT IMPLEMENTED YET.', 'warning');
        }
    });

} else {
    console.warn("Create post elements not found.");
}


}); // End DOMContentLoaded
