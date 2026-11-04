/* RIDE STATS
   Calculations over rides: odometer, distance, month totals, gaps. Used by dashboard and Log Ride. */

function sortedDates(){
  return Object.keys(data.entries).sort();
}

function latestOdometer(){
  const dates = sortedDates();
  if(dates.length===0) return latestServiceOdo();
  const last = data.entries[dates[dates.length-1]];
  return last.evening ?? last.morning ?? 0;
}

function distanceForDate(iso){
  const e = data.entries[iso];
  if(!e || e.morning==null || e.evening==null) return null;
  return e.evening - e.morning;
}

function totalDistanceAll(){
  let total=0;
  sortedDates().forEach(d=>{ const dist=distanceForDate(d); if(dist!=null) total+=dist; });
  return total;
}

function monthStats(monthPrefix){
  const dates = sortedDates().filter(d=>d.startsWith(monthPrefix));
  let total=0, days=0;
  dates.forEach(d=>{
    const dist = distanceForDate(d);
    if(dist!=null){ total+=dist; days++; }
  });
  return {total, days, avg: days? total/days : 0};
}

function findGaps(){
  const dates = sortedDates();
  const gaps = [];
  for(let i=0;i<dates.length-1;i++){
    const cur = data.entries[dates[i]];
    const next = data.entries[dates[i+1]];
    if(cur.evening!=null && next.morning!=null && cur.evening!==next.morning){
      gaps.push({from:dates[i], to:dates[i+1], curEve:cur.evening, nextMorn:next.morning});
    }
  }
  return gaps;
}

function todayDistance(){
  return distanceForDate(todayISO());
}
