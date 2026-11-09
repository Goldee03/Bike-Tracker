/* UTILS
   Number, money and date formatting helpers. */

const fmt = n => Number(n||0).toLocaleString('en-IN');
const fmtMoney = n => '₹' + Number(n||0).toLocaleString('en-IN', {maximumFractionDigits:2});
const pad2 = n => String(n).padStart(2,'0');
const todayISO = () => new Date().toISOString().slice(0,10);
const dLabel = iso => {
  const [y,m,d] = iso.split('-');
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d}-${months[parseInt(m)-1]}`;
};
const monthLabel = ym => {
  const [y,m] = ym.split('-');
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${y}`;
};

// "12 Aug 2026"
const fmtDateLong = iso => {
  const [y,m,d] = iso.split('-');
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
};
// whole days from an ISO date to today
const daysSince = iso => Math.round((new Date(todayISO()+'T00:00:00Z') - new Date(iso+'T00:00:00Z')) / 86400000);
const daysAgoLabel = iso => {
  const n = daysSince(iso);
  return n<=0 ? 'today' : n===1 ? '1 day ago' : `${n} days ago`;
};
