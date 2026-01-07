#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');

// Get access token from supabase CLI
const getAccessToken = () => {
  try {
    const output = execSync('cat ~/.supabase/access-token', { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    console.error('Error getting access token:', error.message);
    process.exit(1);
  }
};

const updateAuthConfig = async () => {
  const accessToken = getAccessToken();
  const projectRef = 'drrrexovkxbhevwsueck';
  
  const data = JSON.stringify({
    SITE_URL: 'https://godrive-academy.netlify.app',
    URI_ALLOW_LIST: 'https://godrive-academy.netlify.app/demo/coach.html,https://godrive-academy.netlify.app/demo/dashboard.html',
    MAILER_AUTOCONFIRM: false,
    EXTERNAL_EMAIL_ENABLED: true,
    SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION: false
  });

  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/config/auth`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Auth configuration updated successfully!');
          console.log('Response:', body);
          resolve(body);
        } else {
          console.error('❌ Error updating auth config. Status:', res.statusCode);
          console.error('Response:', body);
          reject(new Error(body));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

updateAuthConfig()
  .then(() => {
    console.log('\n✅ Configuration complete!');
    console.log('Site URL: https://godrive-academy.netlify.app');
    console.log('Email confirmations: ENABLED');
    console.log('Redirect URLs configured for /demo/coach.html and /demo/dashboard.html');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to update configuration:', error.message);
    process.exit(1);
  });
