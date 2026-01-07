/**
 * Lead Intake Module
 * Handles form submissions and sends data to Supabase or fallback CRM
 */

// Configuration - Update these with your actual values
const CONFIG = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  // Fallback webhook for CRM integration (Pitch Marketing)
  webhookUrl: 'https://hooks.zapier.com/hooks/catch/your-webhook-id',
  source: 'stopstartacademy.com'
};

// Initialize Supabase client (lazy loaded)
let supabase = null;

async function getSupabase() {
  if (!supabase && CONFIG.supabaseUrl !== 'https://your-project.supabase.co') {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }
  return supabase;
}

/**
 * Submit lead to Supabase
 */
async function submitToSupabase(leadData) {
  const client = await getSupabase();
  if (!client) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await client
    .from('leads')
    .insert([{
      first_name: leadData.firstName,
      last_name: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      interest: leadData.interest || leadData.subject,
      message: leadData.message,
      source: leadData.source || CONFIG.source,
      page: leadData.page || window.location.pathname
    }]);
  
  if (error) throw error;
  return data;
}

/**
 * Submit lead to webhook (Zapier, Make, etc.)
 */
async function submitToWebhook(leadData) {
  const response = await fetch(CONFIG.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...leadData,
      source: leadData.source || CONFIG.source,
      page: leadData.page || window.location.pathname,
      timestamp: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error('Webhook submission failed');
  }
  
  return response.json();
}

/**
 * Main lead submission handler
 */
async function submitLead(formData) {
  const leadData = {
    firstName: formData.get('firstName') || formData.get('first_name'),
    lastName: formData.get('lastName') || formData.get('last_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    interest: formData.get('interest'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    source: formData.get('source') || CONFIG.source,
    page: formData.get('page') || window.location.pathname
  };
  
  // Validate required fields
  if (!leadData.email || !leadData.firstName) {
    throw new Error('Name and email are required');
  }
  
  // Try Supabase first, fall back to webhook
  try {
    if (CONFIG.supabaseUrl !== 'https://your-project.supabase.co') {
      await submitToSupabase(leadData);
      console.log('Lead submitted to Supabase');
    } else if (CONFIG.webhookUrl !== 'https://hooks.zapier.com/hooks/catch/your-webhook-id') {
      await submitToWebhook(leadData);
      console.log('Lead submitted to webhook');
    } else {
      // Demo mode - just log
      console.log('Demo mode - Lead data:', leadData);
    }
    
    return { success: true, data: leadData };
  } catch (error) {
    console.error('Lead submission error:', error);
    
    // Try webhook as fallback
    if (CONFIG.webhookUrl !== 'https://hooks.zapier.com/hooks/catch/your-webhook-id') {
      try {
        await submitToWebhook(leadData);
        return { success: true, data: leadData };
      } catch (webhookError) {
        console.error('Webhook fallback failed:', webhookError);
      }
    }
    
    throw error;
  }
}

/**
 * Initialize form handlers
 */
function initLeadForms() {
  const forms = document.querySelectorAll('#crmForm, .lead-form, [data-lead-form]');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      
      try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        const formData = new FormData(form);
        await submitLead(formData);
        
        // Show success
        showNotification('Thanks! We\'ll contact you within 24 hours.', 'success');
        form.reset();
        
      } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Something went wrong. Please try again or call us directly.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'success') {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  
  // Style the notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    background: type === 'success' ? '#10b981' : '#ef4444',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: '9999',
    animation: 'slideIn 0.3s ease'
  });
  
  notification.querySelector('button').style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeadForms);
} else {
  initLeadForms();
}

// Export for module usage
export { submitLead, initLeadForms, CONFIG };
