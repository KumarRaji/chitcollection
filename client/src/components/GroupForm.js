import React, { useState } from 'react';
import axios from 'axios';
import './MemberForm.css';

function GroupForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/groups', formData);
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
          <h2>Add New Group</h2>
          <input
            type="text"
            placeholder="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <button type="submit" className="btn-primary">Create Group</button>
        </form>
      </div>
    </div>
  );
}

export default GroupForm;
