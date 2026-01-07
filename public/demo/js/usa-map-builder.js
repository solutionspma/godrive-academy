// Build interactive USA map from react-usa-map data
import usaMapData from './usa-map-data.js';

export function buildUSAMap(svgElementId, onStateClick) {
  const svgElement = document.getElementById(svgElementId);
  if (!svgElement) return;
  
  const statesData = usaMapData();
  const tooltip = document.getElementById('tooltip');
  
  // Create all 50 state paths
  Object.keys(statesData).forEach(stateCode => {
    const state = statesData[stateCode];
    
    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', state.dimensions);
    path.setAttribute('fill', '#cbd5e1');
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('class', 'state-path');
    path.setAttribute('data-state', stateCode);
    path.setAttribute('data-name', state.name);
    path.style.cursor = 'pointer';
    path.style.transition = 'all 0.3s ease';
    
    // Hover effects
    path.addEventListener('mouseenter', (e) => {
      path.setAttribute('fill', '#a78bfa');
      path.setAttribute('stroke', '#7c3aed');
      path.setAttribute('stroke-width', '2');
      path.style.filter = 'drop-shadow(0 4px 8px rgba(124, 58, 237, 0.3))';
      
      // Show tooltip
      if (tooltip) {
        tooltip.textContent = state.name;
        tooltip.style.opacity = '1';
      }
    });
    
    path.addEventListener('mousemove', (e) => {
      if (tooltip) {
        tooltip.style.left = (e.pageX + 10) + 'px';
        tooltip.style.top = (e.pageY - 30) + 'px';
      }
    });
    
    path.addEventListener('mouseleave', () => {
      path.setAttribute('fill', '#cbd5e1');
      path.setAttribute('stroke', '#ffffff');
      path.setAttribute('stroke-width', '1.5');
      path.style.filter = 'none';
      
      // Hide tooltip
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    });
    
    // Click handler
    path.addEventListener('click', () => {
      // Highlight selected state
      path.setAttribute('fill', '#fb923c');
      path.setAttribute('stroke', '#ea580c');
      path.setAttribute('stroke-width', '2.5');
      
      // Call the callback
      if (onStateClick) {
        onStateClick(stateCode, state.name);
      }
    });
    
    svgElement.appendChild(path);
  });
}
