import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
// import { getUserById } from '../api';
import type { User } from '../types';

export default function Profile() {
  const currentUser = useAuthStore(state => state.user);
  const [profileInfo, setProfileInfo] = useState<User | null>(null);
  const [msg, setMsg] = useState('');

  const loadProfile = async () => {
    try {
      // 后续对接后端
      // const data = await getUserById(currentUser!.Id);
      // setProfileInfo(data);
      setProfileInfo(currentUser);
    } catch {
      setMsg('Failed to load profile info');
    }
  };

  useEffect(() => {
    if (currentUser) loadProfile();
  }, [currentUser]);

  if (!profileInfo) return <p>Loading profile...</p>;

  return (
    <div style={{maxWidth:"700px", margin:"0 auto", padding:"0 1rem"}}>
      <h2>👤 My Profile</h2>
      {msg && <p style={{color:"red"}}>{msg}</p>}

      <div style={{marginTop:"2rem", lineHeight:2}}>
        <p><strong>Username:</strong> {profileInfo.Username}</p>
        <p><strong>Nickname:</strong> {profileInfo.Nickname}</p>
        <p><strong>Email:</strong> {profileInfo.Email}</p>
        <p><strong>Level:</strong> {profileInfo.Level}</p>
        <p><strong>Total Score:</strong> {profileInfo.TotalScore}</p>
        <p><strong>Current Streak:</strong> {profileInfo.StreakDays} days</p>
        <p><strong>Register Date:</strong> {new Date(profileInfo.CreatedAt).toLocaleDateString()}</p>
        <p>
          <strong>Last Study Date:</strong> {
            profileInfo.LastStudyDate
              ? new Date(profileInfo.LastStudyDate).toLocaleDateString()
              : 'No study records yet'
          }
        </p>
      </div>
    </div>
  );
}