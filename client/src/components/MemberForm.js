import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemberForm.css';

function MemberForm({ onSuccess, selectedGroup, onCancel }) {
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    member_number: '',
    name: '',
    father_name: '',
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
        father_name: '',
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className="member-form">
        <h2>புதிய உறுப்பினரை சேர்க்கவும்</h2>
        <input
          type="text"
          placeholder="எண்"
          value={formData.member_number}
          onChange={(e) => setFormData({...formData, member_number: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="பெயர்"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="தந்தை பெயர்"
          value={formData.father_name}
          onChange={(e) => setFormData({...formData, father_name: e.target.value})}
        />
        <input
          type="text"
          placeholder="தொலைபேசி எண்"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
        <input
          type="text"
          placeholder="ஆதார் எண்"
          value={formData.aadhaar}
          onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
        />
        <select
          value={formData.group_id}
          onChange={(e) => setFormData({...formData, group_id: e.target.value})}
          required
        >
          <option value="">குழுவை தேர்ந்தெடுக்கவும்</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <textarea
          placeholder="விலாசம்"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
        <input
          type="number"
          placeholder="தொகை"
          value={formData.chit_amount}
          onChange={(e) => setFormData({...formData, chit_amount: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="ஆரம்ப தேதி"
          value={formData.start_date}
          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="முடிவு தேதி"
          value={formData.due_date}
          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />
        <button type="submit" className="btn-primary">உறுப்பினரை உருவாக்கவும்</button>
        </form>
      </div>
    </div>
  );
}

export default MemberForm;
