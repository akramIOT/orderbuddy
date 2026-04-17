import React from 'react';
import { Restaurant } from '../types/restaurant';
export interface AnnouncementProps {
  restaurant: Restaurant;
}
const Announcement: React.FC = () => {
  return (
    <div className='banner'>
      <div className='banner-content'>
        <h1>Our Announcement</h1>
        <p>Discover our delicious offerings</p>
      </div>
    </div>
  );
};

export default Announcement;
