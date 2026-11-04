/* STATE
   Global variables shared by every file. */

const SHEET_SCHEMA_VERSION = 2;
let data = null;
let activeTab = 'dashboard';

let charts = {};
function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }
