// State data with codes and full names
import { US_MAP_PATHS } from './usaMapPaths.js';

const STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// Build interactive US Map selector
export function buildStateGrid(containerId, onStateSelect) {
  const container = document.getElementById(containerId);
  
  // Build SVG paths from map data
  let pathsHTML = '';
  for (const [code, data] of Object.entries(US_MAP_PATHS)) {
    pathsHTML += `<path id="${code}" d="${data.path}" class="state-path" data-name="${data.name}"/>`;
  }
  
  const html = `
    <div class="state-selector-container">
      <h2 class="state-selector-title">🗺️ Choose Your State</h2>
      <p class="state-selector-subtitle">Click on any state on the map</p>
      <div class="usa-map-container">
        <svg viewBox="0 0 960 600" class="usa-map" preserveAspectRatio="xMidYMid meet">
          <g id="states">
            ${pathsHTML}
          </g>
        </svg>
      </div>
      <div id="stateTooltip" class="state-tooltip hidden"></div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Setup state click handlers
  const statePaths = document.querySelectorAll('.state-path');
  const tooltip = document.getElementById('stateTooltip');
  
  statePaths.forEach(path => {
    const stateCode = path.id;
    const stateName = path.getAttribute('data-name');
    
    // Hover effects
    path.addEventListener('mouseenter', (e) => {
      tooltip.textContent = stateName;
      tooltip.classList.remove('hidden');
      path.classList.add('hover');
    });
    
    path.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 15 + 'px';
      tooltip.style.top = e.pageY + 15 + 'px';
    });
    
    path.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
      if (!path.classList.contains('selected')) {
        path.classList.remove('hover');
      }
    });
    
    // Click handler
    path.addEventListener('click', () => {
      // Remove previous selection
      statePaths.forEach(p => p.classList.remove('selected'));
      // Select this one
      path.classList.add('selected');
      // Callback
      if (onStateSelect) {
        onStateSelect(stateCode, stateName);
      }
    });
  });
}

// Export for use in coach.js
export { STATES };
