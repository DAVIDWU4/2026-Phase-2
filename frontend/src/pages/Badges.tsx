import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { Badge, UserBadge } from '../types';
// import { getAllBadges, getUserUnlockedBadges } from '../api';

export default function Badges() {
  const user = useAuthStore(state => state.user);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  const loadBadgeData = async () => {
    try {
      // 后续取消注释对接接口
      // const all = await getAllBadges();
      // const userUnlocked = await getUserUnlockedBadges(user!.Id);
      // setAllBadges(all);
      // setUnlockedBadgeIds(userUnlocked.map(item => item.BadgeId));
    } catch {
      setMessage('Failed to load badge data');
    }
  };

  useEffect(() => {
    if (user) loadBadgeData();
  }, [user]);

  return (
    <div style={{maxWidth:"1000px", margin:"0 auto", padding:"0 1rem"}}>
      <h2>🏅 My Badges</h2>
      {message && <p style={{color:"red"}}>{message}</p>}

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:"1.2rem", marginTop:"2rem"}}>
        {allBadges.length === 0 ? (
          <p>No badge data loaded yet.</p>
        ) : (
          allBadges.map(badge => {
            const isUnlocked = unlockedBadgeIds.includes(badge.Id);
            return (
              <div key={badge.Id} style={{
                padding:"1rem",
                border:"1px solid #ddd",
                borderRadius:8,
                opacity: isUnlocked ? 1 : 0.5
              }}>
                <h3>{badge.Name}</h3>
                <p>{badge.Description}</p>
                <small>Required Score: {badge.RequiredScore}</small>
                {isUnlocked && <p style={{color:"green", marginTop:8}}>✅ Unlocked</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}