import React, { useState } from 'react';
import axios from 'axios';
import './MemberForm.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function GroupForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/groups`, formData);
      setFormData({ name: '', description: '' });
      onSuccess();
    } catch (err) {
      alert('Error creating group');
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className="member-form">
          <h2>புதிய குழு சேர்க்கவும்</h2>
          <input
            type="text"
            placeholder="குழு பெயர்"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <textarea
            placeholder="விளக்கம்"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <button type="submit" className="btn-primary">குழுவை உருவாக்கு</button>
        </form>
      </div>
    </div>
  );
}

export default GroupForm;
