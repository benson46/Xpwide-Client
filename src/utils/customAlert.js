export const showCustomAlert = (message) => {
    // Create alert element
    const alertBox = document.createElement('div');
    
    // Set alert styles
    alertBox.style.position = 'fixed';
    alertBox.style.top = '100px';
    alertBox.style.left = '50%'; 
    alertBox.style.transform = 'translateX(-50%)'; 
    alertBox.style.backgroundColor = 'black'; 
    alertBox.style.color = 'white'; 
    alertBox.style.padding = '15px 20px'; 
    alertBox.style.borderRadius = '8px'; 
    alertBox.style.textAlign = 'center'; 
    alertBox.style.fontSize = '14px'; 
    alertBox.style.width = '280px'; 
    alertBox.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.2)'; 
    alertBox.style.zIndex = '99999'; 
    alertBox.textContent = message; 
  
    document.body.appendChild(alertBox);
  
    setTimeout(() => {
        alertBox.remove();
        localStorage.clear();
        window.location.href = '/login';
    }, 1500);
  };
  