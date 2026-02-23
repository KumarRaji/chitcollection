import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemberForm.css';

function MemberForm({ onSuccess, selectedGroup }) {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    member_number: '',
    name: '',
    phone: '',
    aadhaar: '',
    address: '',
    chit_amount: '',
    start_date: '',
    due_date: '',
    group_id: selectedGroup?.id || ''
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setFormData(prev => ({...prev, group_id: selectedGroup.id}));
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (photo) data.append('photo', photo);

    try {
      await axios.post('/api/members', data);
      setFormData({
        member_number: '',
        name: '',
        phone: '',
        aadhaar: '',
        address: '',
        chit_amount: '',
        start_date: '',
        due_date: '',
        group_id: selectedGroup?.id || ''
      });
      setPhoto(null);
      onSuccess();
    } catch (err) {
      alert('Error creating member');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="member-form">
        <h2>Add New Member</h2>
        <input
          type="text"
          placeholder="Member Number"
          value={formData.member_number}
          onChange={(e) => setFormData({...formData, member_number: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        <input
          type="text"
          placeholder="Aadhaar Number"
          value={formData.aadhaar}
          onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
        />
        <select
          value={formData.group_id}
          onChange={(e) => setFormData({...formData, group_id: e.target.value})}
          required
        >
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        <input
          type="number"
          placeholder="Chit Amount"
          value={formData.chit_amount}
          onChange={(e) => setFormData({...formData, chit_amount: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="Start Date"
          value={formData.start_date}
          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="Due Date"
          value={formData.due_date}
          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <button type="submit" className="btn-primary">Create Member</button>
      </form>
    </div>
  );
}

export default MemberForm;
